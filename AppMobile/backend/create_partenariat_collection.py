# Script Python pour créer la collection 'partenariat' et insérer un exemple dans MongoDB Atlas
from pymongo import MongoClient

# Remplace par ta propre URI MongoDB Atlas si besoin
client = MongoClient('mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/')
db = client['DBLEONI']

# Création de la collection (facultatif, insert_one la créera si besoin)
partenariat = db['partenariat']

# Exemple de document
exemple = {
    "titre": "Titre du partenariat",
    "description": "Description du partenariat",
    "image": "https://lien-vers-image-ou-logo.png",
    "type": "formation",  # ex: "formation", "loisirs", "offres spéciales"

}

result = partenariat.insert_one(exemple)
print(f"Partenariat inséré avec l'_id : {result.inserted_id}")
