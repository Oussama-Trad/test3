from flask import Blueprint, request, jsonify
from flask import current_app as app
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from app import db, token_required, employee_collection

document_type_collection = db['documentType']
document_request_collection = db['document_requests']

bp = Blueprint('documents', __name__, url_prefix='/api')

# Lister les types de documents
def serialize_doc_type(doc):
    return {
        'id': str(doc['_id']),
        'titre': doc.get('titre', ''),
        'description': doc.get('description', ''),
        'dateCreation': doc.get('dateCreation'),
        'createdBy': doc.get('createdBy', '')
    }

@bp.route('/document-types', methods=['GET'])
def get_document_types():
    try:
        docs = list(document_type_collection.find())
        return jsonify({'documentTypes': [serialize_doc_type(d) for d in docs]}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Créer une demande de document
@bp.route('/document-requests', methods=['POST'])
@token_required
def create_document_request(current_user):
    try:
        data = request.get_json()
        document_type_id = data.get('documentTypeId')
        commentaire = data.get('commentaire', '')
        if not document_type_id:
            return jsonify({'message': 'documentTypeId is required'}), 400
        # Récupérer les infos employé
        employee_id = current_user['id']
        # Chercher l'objet employé pour avoir location et departement
        employee = employee_collection.find_one({'id': employee_id})
        if not employee:
            return jsonify({'message': 'Employé introuvable'}), 404
        # Récupérer les IDs de location et departement
        location_id = employee.get('location')
        department_id = employee.get('departement')
        # Créer la demande
        doc_request = {
            'employee_id': employee_id,
            'documentTypeId': document_type_id,
            'location_id': location_id,
            'department_id': department_id,
            'status': 'En attente',
            'createdAt': datetime.utcnow(),
            'commentaire': commentaire
        }
        document_request_collection.insert_one(doc_request)
        return jsonify({'message': 'Demande créée', 'request': doc_request}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Lister les demandes de l'employé connecté
@bp.route('/document-requests', methods=['GET'])
@token_required
def list_document_requests(current_user):
    try:
        employee_id = current_user['id']
        requests = list(document_request_collection.find({'employee_id': employee_id}))
        for r in requests:
            r['id'] = str(r['_id'])
            r.pop('_id', None)
        return jsonify({'requests': requests}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
