from flask import Blueprint, request, jsonify
from flask import current_app as app
from bson import ObjectId
from extensions import db, employee_collection
from auth_utils import token_required

bp = Blueprint('actualites', __name__, url_prefix='/api')

# Helper: serialize actualité

def serialize_actualite(doc):
    return {
        'id': str(doc.get('_id', '')),
        'titre': doc.get('titre', ''),
        'description': doc.get('description', ''),
        'photo': doc.get('photo', ''),
        'locationId': doc.get('locationId', ''),
        'departementId': doc.get('departementId', ''),
    }

@bp.route('/actualites', methods=['GET'])
@token_required
def get_actualites(current_user):
    try:
        # Récupérer locationId et departementId de l'employé
        user_location = current_user.get('locationId', current_user.get('location', ''))
        user_departement = current_user.get('departementId', current_user.get('departement', ''))
        # Filtre pour actualités ciblées
        query = {
            '$or': [
                # Ciblé strict
                {'locationId': user_location, 'departementId': user_departement},
                # Superadmin: all/all
                {'locationId': 'all', 'departementId': 'all'},
                # Superadmin: all/location
                {'locationId': 'all', 'departementId': user_departement},
                # Superadmin: location/all
                {'locationId': user_location, 'departementId': 'all'},
            ]
        }
        actualites = list(db['actualite'].find(query))
        return jsonify({'actualites': [serialize_actualite(a) for a in actualites]}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
