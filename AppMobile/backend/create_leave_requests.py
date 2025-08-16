import pymongo
from datetime import datetime

MONGODB_URI = 'mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/'
client = pymongo.MongoClient(MONGODB_URI)
db = client['DBLEONI']

# Création de la collection leaveRequests (conge) avec un exemple de document
leave_request = {
    "employeeId": "EMPLOYEE_ID",
    "locationId": "LOCATION_ID",
    "departementId": "DEPARTEMENT_ID",
    "type": "annuel",  # annuel, maladie, exceptionnel, etc.
    "startDate": datetime(2025, 8, 20),
    "endDate": datetime(2025, 8, 25),
    "status": "En attente",
    "createdAt": datetime.utcnow(),
    "updatedAt": datetime.utcnow()
}

# Crée la collection si elle n'existe pas et insère un exemple
result = db['leaveRequests'].insert_one(leave_request)
print(f"leaveRequests créée, id exemple: {result.inserted_id}")

# Index pour filtrage rapide
try:
    db['leaveRequests'].create_index([('employeeId', 1)])
    db['leaveRequests'].create_index([('locationId', 1)])
    db['leaveRequests'].create_index([('departementId', 1)])
    print("Indexes créés.")
except Exception as e:
    print("Erreur création index:", e)
