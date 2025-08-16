
# --- APP INIT ---
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash
from datetime import datetime, timedelta
from bson import ObjectId
import jwt
import os
from functools import wraps
from pymongo import MongoClient
from extensions import db, employee_collection, location_collection, departement_collection
from pymongo import MongoClient

# Connexion à la collection messages
client = MongoClient('mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/')
db = client['DBLEONI']
messages_collection = db['messages']
from events_api import bp_events
from auth_utils import token_required
from documents import bp as documents_bp
from actualites import bp as actualites_bp

# --- APP INIT ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
app.config['SECRET_KEY'] = '123'  # JWT_SECRET_KEY

# --- BLUEPRINTS ---
app.register_blueprint(documents_bp)
app.register_blueprint(actualites_bp)
app.register_blueprint(bp_events)

# Nouvelle route pour lister les conversations d'un employé (mobile)

@app.route('/api/conversations', methods=['GET'])
def get_employee_conversations():
    print("[DEBUG] /api/conversations route CALLED")
    try:
        employee_id = request.args.get('employeeId')
        print(f"[DEBUG] employeeId param: {employee_id}")
        if not employee_id:
            print("[DEBUG] Pas d'employeeId fourni")
            return jsonify([])
        # Chercher l'employé pour récupérer son _id (ObjectId) et son id (string)
        employee = db.employee.find_one({'id': employee_id})
        print(f"[DEBUG] employee query result: {employee}")
        employee_object_id = None
        if employee:
            employee_object_id = str(employee.get('_id'))
            print(f"[DEBUG] Employé trouvé: id={employee_id}, _id={employee_object_id}")
        else:
            print(f"[DEBUG] Aucun employé trouvé avec id={employee_id}")
        # Récupérer tous les messages où l'employé est sender ou receiver (par id ou _id)
        or_conditions = [
            {'sender_id': employee_id},
            {'receiver_id': employee_id}
        ]
        if employee_object_id:
            or_conditions.append({'sender_id': employee_object_id})
            or_conditions.append({'receiver_id': employee_object_id})
        print(f"[DEBUG] or_conditions for messages: {or_conditions}")
        messages = list(db.messages.find({
            '$or': or_conditions
        }).sort('timestamp', -1))
        print(f"[DEBUG] Messages trouvés pour employé {employee_id} (ou _id {employee_object_id}): {len(messages)}")
        for m in messages:
            print(f"[DEBUG] Message: sender_id={m.get('sender_id')} receiver_id={m.get('receiver_id')} content={m.get('content')}")
        # Regrouper par admin contacté
        conversations = {}
        for msg in messages:
            # L'autre participant
            if msg['sender_id'] == employee_id:
                admin_id = msg['receiver_id']
            else:
                admin_id = msg['sender_id']
            print(f"[DEBUG] Recherche admin pour admin_id={admin_id}")
            admin = None
            from bson import ObjectId
            # Essayer par _id (ObjectId)
            try:
                admin = db.admin.find_one({'_id': ObjectId(admin_id)})
                if not admin:
                    admin = db.superadmin.find_one({'_id': ObjectId(admin_id)})
            except Exception as e:
                print(f"[DEBUG] Exception ObjectId: {e}")
            # Essayer par _id (string)
            if not admin:
                admin = db.admin.find_one({'_id': admin_id})
                if not admin:
                    admin = db.superadmin.find_one({'_id': admin_id})
            # Essayer par id personnalisé (champ 'id')
            if not admin:
                admin = db.admin.find_one({'id': admin_id})
                if not admin:
                    admin = db.superadmin.find_one({'id': admin_id})
            print(f"[DEBUG] Résultat admin trouvé: {admin}")
            if not admin:
                continue
            if admin_id not in conversations:
                conversations[admin_id] = {
                    'admin': {
                        '_id': str(admin_id),
                        'nom': admin.get('nom', ''),
                        'prenom': admin.get('prenom', ''),
                        'locationId': str(admin.get('location', '')),
                        'departementId': str(admin.get('departement', '')),
                    },
                    'lastMessage': msg.get('content', msg.get('message', '')),
                    'lastDate': msg.get('timestamp')
                }
        print(f"[DEBUG] Conversations trouvées: {len(conversations)}")
        return jsonify(list(conversations.values()))
    except Exception as e:
        print(f"[DEBUG] Exception dans /api/conversations: {e}")
        return jsonify({'error': str(e)}), 500


# --- IMPORTS EN HAUT DU FICHIER ---
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash
from datetime import datetime, timedelta
from bson import ObjectId
import jwt
import os
from functools import wraps
from pymongo import MongoClient
from extensions import db, employee_collection, location_collection, departement_collection
from pymongo import MongoClient

# Connexion à la collection messages
client = MongoClient('mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/')
db = client['DBLEONI']
messages_collection = db['messages']
from events_api import bp_events
from auth_utils import token_required
from documents import bp as documents_bp
from actualites import bp as actualites_bp

# --- APP INIT ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
app.config['SECRET_KEY'] = '123'  # JWT_SECRET_KEY

# --- BLUEPRINTS ---
app.register_blueprint(documents_bp)
app.register_blueprint(actualites_bp)
app.register_blueprint(bp_events)

# --- ENDPOINT ADMINS ---
@app.route('/api/admins', methods=['GET'])
def get_admins():
    # Connexion directe à la base MongoDB (même config que extensions.py)
    client = MongoClient('mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/')
    db = client['DBLEONI']
    admin_col = db['admin']
    superadmin_col = db['superadmin']

    location = request.args.get('locationId')
    departement = request.args.get('departementId')

    # Récupérer tous les admins/superadmins
    admins = list(admin_col.find({}))
    superadmins = list(superadmin_col.find({}))

    # Filtrage côté Python pour robustesse (comparaison sur string)
    def match_filters(a):
        if location and str(a.get('location', '')) != str(location):
            return False
        if departement and str(a.get('departement', '')) != str(departement):
            return False
        return True

    filtered_admins = [a for a in admins if match_filters(a)]
    filtered_superadmins = [a for a in superadmins if match_filters(a)]


    def serialize_admin(a):
        return {
            '_id': str(a['_id']),
            'nom': a.get('nom', ''),
            'prenom': a.get('prenom', ''),
            'locationId': str(a.get('location', '')),
            'departementId': str(a.get('departement', '')),
            'role': a.get('role', 'admin'),
        }
    def serialize_superadmin(a):
        return {
            '_id': str(a['_id']),
            'nom': a.get('nom', ''),
            'prenom': a.get('prenom', ''),
            'locationId': str(a.get('location', '')),
            'departementId': str(a.get('departement', '')),
            'role': a.get('role', 'superadmin'),
        }

    all_admins = [serialize_admin(a) for a in filtered_admins] + [serialize_superadmin(a) for a in filtered_superadmins]
    return jsonify(all_admins)


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



# --- ROUTES MESSAGERIE ---
@app.route('/api/messages', methods=['GET', 'POST'])
def messages():
    print(f"--- /api/messages {request.method} ---")
    print(f"Headers: {dict(request.headers)}")
    if request.method == 'POST':
        try:
            data = request.get_json()
            print(f"POST data: {data}")
            sender_id = data.get('sender_id') or data.get('senderId')
            receiver_id = data.get('receiver_id') or data.get('receiverId')
            content = data.get('content') or data.get('message')
            if not sender_id or not receiver_id or not content:
                print("Champ manquant dans POST /api/messages")
                return jsonify({'message': 'sender_id, receiver_id, and content are required'}), 400
            message = {
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'content': content,
                'timestamp': datetime.utcnow()
            }
            result = messages_collection.insert_one(message)
            print(f"Message inséré avec _id: {result.inserted_id}")

            # --- GESTION CONVERSATIONS ---
            # On cherche une conversation existante entre les deux participants
            participants = sorted([str(sender_id), str(receiver_id)])
            conv_query = {"participants": participants}
            conversation = db.conversations.find_one(conv_query)
            if conversation:
                # Mettre à jour le dernier message et la date
                db.conversations.update_one(
                    {"_id": conversation["_id"]},
                    {"$set": {
                        "lastMessage": {
                            "sender_id": sender_id,
                            "content": content,
                            "timestamp": message['timestamp']
                        },
                        "updatedAt": datetime.utcnow()
                    }}
                )
                print(f"Conversation mise à jour pour participants {participants}")
            else:
                # Créer une nouvelle conversation avec snapshot employé
                employee_snapshot = None
                # On suppose que l'employé est toujours le sender (sinon inverser)
                emp = None
                try:
                    emp = db.employee.find_one({'id': sender_id})
                    if not emp:
                        emp = db.employee.find_one({'_id': sender_id})
                except Exception as e:
                    print(f"[DEBUG] Exception recherche employé pour snapshot: {e}")
                if emp:
                    employee_snapshot = {
                        'id': str(emp.get('id', '')),
                        'nom': emp.get('nom', ''),
                        'prenom': emp.get('prenom', ''),
                        'locationId': str(emp.get('locationId', emp.get('location', ''))),
                        'departementId': str(emp.get('departementId', emp.get('departement', '')))
                    }
                conv_doc = {
                    "participants": participants,
                    "lastMessage": {
                        "sender_id": sender_id,
                        "content": content,
                        "timestamp": message['timestamp']
                    },
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow(),
                    "employeeSnapshot": employee_snapshot
                }
                db.conversations.insert_one(conv_doc)
                print(f"Nouvelle conversation créée pour participants {participants} (snapshot employé inclus)")

            return jsonify({'message': 'Message sent successfully'}), 201
        except Exception as e:
            print(f"Erreur POST /api/messages: {e}")
            return jsonify({'message': str(e)}), 500
    else:  # GET
        try:
            user1 = request.args.get('user1')
            user2 = request.args.get('user2')
            print(f"GET params: user1={user1}, user2={user2}")
            if not user1 or not user2:
                print("Paramètre manquant dans GET /api/messages")
                return jsonify({'message': 'user1 and user2 are required'}), 400
            conv = list(messages_collection.find({
                '$or': [
                    {'sender_id': user1, 'receiver_id': user2},
                    {'sender_id': user2, 'receiver_id': user1}
                ]
            }).sort('timestamp', 1))
            print(f"Messages trouvés: {len(conv)}")
            messages_list = [{
                '_id': str(m['_id']),
                'sender_id': m['sender_id'],
                'receiver_id': m['receiver_id'],
                'content': m['content'],
                'timestamp': m['timestamp'].isoformat() + 'Z'
            } for m in conv]
            return jsonify(messages_list), 200
        except Exception as e:
            print(f"Erreur GET /api/messages: {e}")
            return jsonify({'message': str(e)}), 500

# Nouvelle route pour lister les conversations d'un employé (mobile)
@app.route('/api/conversations', methods=['GET'])
def get_employee_conversations():
    print("[DEBUG] /api/conversations route CALLED")
    try:
        employee_id = request.args.get('employeeId')
        print(f"[DEBUG] employeeId param: {employee_id}")
        if not employee_id:
            print("[DEBUG] Pas d'employeeId fourni")
            return jsonify([])
        # On cherche toutes les conversations où l'employé est participant
        conversations = list(db.conversations.find({"participants": {"$in": [employee_id]}}).sort("updatedAt", -1))
        print(f"[DEBUG] Conversations trouvées: {len(conversations)}")
        # Pour chaque conversation, retrouver l'admin participant
        result = []
        for conv in conversations:
            admin_id = [pid for pid in conv["participants"] if pid != employee_id][0] if len(conv["participants"]) > 1 else None
            admin = None
            if admin_id:
                admin = db.admin.find_one({'id': admin_id})
                if not admin:
                    admin = db.admin.find_one({'_id': admin_id})
                if not admin:
                    admin = db.superadmin.find_one({'id': admin_id})
                if not admin:
                    admin = db.superadmin.find_one({'_id': admin_id})
            result.append({
                'admin': {
                    '_id': str(admin_id) if admin_id else '',
                    'nom': admin.get('nom', '') if admin else '',
                    'prenom': admin.get('prenom', '') if admin else '',
                    'locationId': str(admin.get('location', '')) if admin else '',
                    'departementId': str(admin.get('departement', '')) if admin else '',
                },
                'lastMessage': conv.get('lastMessage', {}).get('content', ''),
                'lastDate': conv.get('lastMessage', {}).get('timestamp', ''),
            })
        return jsonify(result)
    except Exception as e:
        print(f"[DEBUG] Exception dans /api/conversations: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

