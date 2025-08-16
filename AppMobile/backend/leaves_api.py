
print('[DEBUG] leave_requests_routes.py loaded')

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from datetime import datetime
from extensions import db, employee_collection, location_collection, departement_collection

leave_requests_api_bp = Blueprint('leave_requests_api', __name__, url_prefix='')

# --- LEAVE REQUESTS API ---
@leave_requests_api_bp.route('/api/leave-requests', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_leave_request():
    print("[DEBUG] POST /api/leave-requests called")
    print(f"[DEBUG] Headers: {dict(request.headers)}")
    data = request.get_json()
    print(f"[DEBUG] Data received: {data}")
    required = ['employeeId', 'locationId', 'departementId', 'type', 'startDate', 'endDate']
    if not all(k in data for k in required):
        return jsonify({'error': 'Champs manquants'}), 400
    # Récupérer les vraies valeurs
    employee = employee_collection.find_one({'id': data['employeeId']})
    location = location_collection.find_one({'_id': data['locationId']})
    departement = departement_collection.find_one({'_id': data['departementId']})

    leave = {
        'employeeId': data['employeeId'],
        'employeeNom': employee['nom'] if employee else '',
        'employeePrenom': employee['prenom'] if employee else '',
        'locationId': data['locationId'],
        'locationNom': location['nom'] if location else '',
        'departementId': data['departementId'],
        'departementNom': departement['nom'] if departement else '',
        'type': data['type'],
        'startDate': data['startDate'],
        'endDate': data['endDate'],
        'status': 'En attente',
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    }
    result = db.leaveRequests.insert_one(leave)
    leave['_id'] = str(result.inserted_id)
    print(f"[DEBUG] Leave inserted: {leave}")
    return jsonify(leave), 201

# Liste des demandes d’un employé
@leave_requests_api_bp.route('/api/leave-requests', methods=['GET', 'OPTIONS'])
@cross_origin()
def list_leave_requests():
    print("[DEBUG] GET /api/leave-requests called")
    print(f"[DEBUG] Args: {dict(request.args)}")
    employee_id = request.args.get('employeeId')
    if not employee_id:
        return jsonify([])
    reqs = list(db.leaveRequests.find({'employeeId': employee_id}))
    print(f"[DEBUG] Found {len(reqs)} leave requests for employeeId={employee_id}")
    for r in reqs:
        r['_id'] = str(r['_id'])
    return jsonify(reqs)
