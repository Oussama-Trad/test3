# Script de migration pour corriger les champs location/locationId et departement/departementId dans la collection employee
# À exécuter dans le shell MongoDB ou via un script Python/MongoDB

from pymongo import MongoClient
from bson import ObjectId

MONGODB_URI = 'mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/'
client = MongoClient(MONGODB_URI)
db = client['DBLEONI']
employee_collection = db['employee']

# Pour chaque employé, renommer les champs location -> locationId et departement -> departementId
for emp in employee_collection.find():
    updates = {}
    if 'location' in emp:
        updates['locationId'] = emp['location']
        updates['location'] = ''  # Optionnel : efface l'ancien champ
    if 'departement' in emp:
        updates['departementId'] = emp['departement']
        updates['departement'] = ''  # Optionnel : efface l'ancien champ
    if updates:
        employee_collection.update_one({'_id': emp['_id']}, {'$set': updates})

print('Migration terminée. Vérifiez vos données!')
