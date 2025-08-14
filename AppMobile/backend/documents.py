from flask import Blueprint, request, jsonify
from flask import current_app as app
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from extensions import db, employee_collection
from auth_utils import token_required

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
    print('DEBUG - Route /api/document-requests appelée')
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
        # Récupérer l'ID MongoDB de la localisation
        location_name = employee.get('location')
        departement_name = employee.get('departement')
        print('DEBUG - location_name:', location_name)
        print('DEBUG - departement_name:', departement_name)
        location_doc = db['location'].find_one({'_id': ObjectId(location_name)}) if ObjectId.is_valid(location_name) else db['location'].find_one({'nom': location_name})
        departement_doc = db['departement'].find_one({'_id': ObjectId(departement_name)}) if ObjectId.is_valid(departement_name) else db['departement'].find_one({'nom': departement_name})
        print('DEBUG - location_doc:', location_doc)
        print('DEBUG - departement_doc:', departement_doc)
        location_id = str(location_doc['_id']) if location_doc else location_name
        department_id = str(departement_doc['_id']) if departement_doc else departement_name
        # Créer la demande avec les bons noms de champs (camelCase)
        doc_request = {
            'employeeId': employee_id,
            'documentTypeId': document_type_id,
            'locationId': location_id,
            'departmentId': department_id,
            'status': 'En attente',
            'createdAt': datetime.utcnow(),
            'commentaire': commentaire
        }
        document_request_collection.insert_one(doc_request)
        # Convertir tous les ObjectId en str pour la réponse JSON
        doc_request_serializable = {k: str(v) if isinstance(v, ObjectId) else v for k, v in doc_request.items()}
        return jsonify({'message': 'Demande créée', 'request': doc_request_serializable}), 201
    except Exception as e:
        import traceback
        print('DEBUG - Exception attrapée dans /api/document-requests')
        print('ERREUR lors de la création de la demande de document :')
        traceback.print_exc()
        print('DEBUG - Fin du except')
        return jsonify({'message': str(e)}), 500

# Lister les demandes de l'employé connecté
@bp.route('/document-requests', methods=['GET'])
@token_required
def list_document_requests(current_user):
    try:
        employee_id = current_user['id']
        # Adapter la recherche pour les nouveaux champs camelCase
        requests = list(document_request_collection.find({'employeeId': employee_id}))
        for r in requests:
            r['id'] = str(r['_id'])
            r.pop('_id', None)
        return jsonify({'requests': requests}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
