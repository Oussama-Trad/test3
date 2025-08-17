# Script Python pour créer la collection 'reclamations' et insérer un exemple dans MongoDB Atlas
from pymongo import MongoClient
from datetime import datetime

# Remplace par ta propre URI MongoDB Atlas si besoin
client = MongoClient('mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/')
db = client['DBLEONI']

# Création de la collection (facultatif, insert_one la créera si besoin)
reclamations = db['reclamations']

# Exemple de document
exemple = {
    "titre": "Problème de badgeuse",
    "description": "La badgeuse ne fonctionne plus à l'entrée principale.",
    "piece_jointe": "",  # URL ou nom de fichier si upload
    "statut": "En attente",
    "date": datetime.utcnow(),
    "employeId": "EMP12345",
    "locationId": "LOC67890",
    "departementId": "DEP54321"
}

result = reclamations.insert_one(exemple)
print(f"Réclamation insérée avec l'_id : {result.inserted_id}")
