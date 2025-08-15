from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from events_api import bp_events
from datetime import datetime, timedelta
import jwt
import os
from functools import wraps
from auth_utils import token_required

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configuration
app.config['SECRET_KEY'] = '123'  # JWT_SECRET_KEY

# Connexion MongoDB et collections centralisées dans extensions.py
from extensions import db, employee_collection, location_collection, departement_collection


# Importer et enregistrer les blueprints
from documents import bp as documents_bp
app.register_blueprint(documents_bp)
from actualites import bp as actualites_bp
app.register_blueprint(actualites_bp)
app.register_blueprint(bp_events)


@app.route('/api/locations-full', methods=['GET'])
def get_locations_full():
    locations = list(location_collection.find({}, {'_id': 1, 'nom': 1}))
    return jsonify([{'id': str(loc['_id']), 'nom': loc['nom']} for loc in locations])

@app.route('/api/departments-full', methods=['GET'])
def get_departments_full():
    departements = list(departement_collection.find({}, {'_id': 1, 'nom': 1}))
    return jsonify([{'id': str(dep['_id']), 'nom': dep['nom']} for dep in departements])

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print('--- Données reçues pour inscription ---')
        print(data)
        # Validation
        required_fields = ['nom', 'prenom', 'id', 'adresse1', 'numTel', 'location', 'departement', 'password']
        for field in required_fields:
            if field not in data:
                print(f"Champ manquant côté backend : {field}")
                return jsonify({'message': f'{field} is required'}), 400
        # Check if employee already exists
        if employee_collection.find_one({'id': data['id']}):
            print("ID déjà existant")
            return jsonify({'message': 'Employee with this ID already exists'}), 400
        if employee_collection.find_one({'numTel': data['numTel']}):
            print("Numéro de téléphone déjà existant")
            return jsonify({'message': 'Employee with this phone number already exists'}), 400
        # Hash password
        hashed_password = generate_password_hash(data['password'])
        # Chercher l'ID MongoDB pour location et departement
        location_doc = location_collection.find_one({'nom': data['location']})
        departement_doc = departement_collection.find_one({'nom': data['departement']})
        location_id = str(location_doc['_id']) if location_doc else data['location']
        departement_id = str(departement_doc['_id']) if departement_doc else data['departement']
        # Create employee document avec locationId et departementId
        employee = {
            'nom': data['nom'],
            'prenom': data['prenom'],
            'id': data['id'],
            'adresse1': data['adresse1'],
            'adresse2': data.get('adresse2', ''),
            'numTel': data['numTel'],
            'numTelParentale': data.get('numTelParentale', ''),
            'locationId': location_id,
            'departementId': departement_id,
            'photoDeProfil': data.get('photoDeProfil', ''),
            'password': hashed_password,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        result = employee_collection.insert_one(employee)
        # Generate JWT token
        token = jwt.encode({
            'adresse1': data['adresse1'],
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({
            'message': 'Employee registered successfully',
            'token': token,
            'employee': {
                'id': data['id'],
                'nom': data['nom'],
                'prenom': data['prenom'],
                'email': data.get('email', ''),
                'locationId': location_id,
                'departementId': departement_id
            }
        }), 201
    except Exception as e:
        print('Erreur backend lors de l’inscription :', str(e))
        return jsonify({'message': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('adresse1') or not data.get('password'):
            return jsonify({'message': 'adresse1 and password are required'}), 400
        
        # Find employee by ID
        employee = employee_collection.find_one({'adresse1': data['adresse1']})
        
        if not employee:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check password
        if not check_password_hash(employee['password'], data['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'adresse1': employee['adresse1'],
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'employee': {
                'id': employee['id'],
                'nom': employee['nom'],
                'prenom': employee['prenom'],
                'locationId': employee.get('locationId', employee.get('location', '')),
                'departementId': employee.get('departementId', employee.get('departement', '')),
                'photoDeProfil': employee.get('photoDeProfil', '')
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500
@app.route('/api/locations', methods=['GET'])
def get_locations():
    try:
        locations = list(location_collection.find({}, {'_id': 0, 'nom': 1}))
        return jsonify({'locations': [loc['nom'] for loc in locations]}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
@app.route('/api/departments/<location>', methods=['GET'])
def get_departments(location):
    try:
        # Find location ID
        location_doc = location_collection.find_one({'nom': location})
        if not location_doc:
            return jsonify({'message': 'Location not found'}), 404
        
        # Find departments for this location
        departments = list(departement_collection.find(
            {'locationId': location_doc['_id']}, 
            {'_id': 0, 'nom': 1}
        ))
        
        return jsonify({'departments': [dept['nom'] for dept in departments]}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/profile', methods=['GET', 'PUT'])
@token_required
def profile(current_user):
    if request.method == 'GET':
        try:
            employee_data = {
                'id': current_user['id'],
                'nom': current_user['nom'],
                'prenom': current_user['prenom'],
                'adresse1': current_user['adresse1'],
                'adresse2': current_user.get('adresse2', ''),
                'numTel': current_user['numTel'],
                'numTelParentale': current_user.get('numTelParentale', ''),
                'locationId': current_user.get('locationId', current_user.get('location', '')),
                'departementId': current_user.get('departementId', current_user.get('departement', '')),
                'photoDeProfil': current_user.get('photoDeProfil', '')
            }
            return jsonify({'employee': employee_data}), 200
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            update_fields = {}
            for field in ['nom', 'prenom', 'adresse1', 'adresse2', 'numTel', 'numTelParentale', 'locationId', 'departementId', 'photoDeProfil']:
                if field in data:
                    update_fields[field] = data[field]
            # Mot de passe (optionnel)
            if 'password' in data and data['password']:
                update_fields['password'] = generate_password_hash(data['password'])
            update_fields['updatedAt'] = datetime.utcnow()
            employee_collection.update_one({'id': current_user['id']}, {'$set': update_fields})
            return jsonify({'success': True, 'message': 'Profil mis à jour'}), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'message': 'Mobile app backend is running'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

