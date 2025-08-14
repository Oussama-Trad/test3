import pymongo

MONGODB_URI = 'mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/'
client = pymongo.MongoClient(MONGODB_URI)
db = client['DBLEONI']

# Exemple d'actualités à insérer
actualites = [
    {
        "titre": "Nouvelle machine installée",
        "description": "Une nouvelle machine a été installée dans l'atelier.",
        "photo": "machine.jpg",
        "locationId": "ID_LOCATION_1",
        "departementId": "ID_DEPARTEMENT_1"
    },
    {
        "titre": "Séminaire RH",
        "description": "Séminaire RH prévu la semaine prochaine.",
        "photo": "seminaire.jpg",
        "locationId": "ID_LOCATION_2",
        "departementId": "ID_DEPARTEMENT_2"
    }
]

result = db['actualite'].insert_many(actualites)
print(f"{len(result.inserted_ids)} actualités insérées.")
