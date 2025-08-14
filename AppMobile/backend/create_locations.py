import pymongo

MONGODB_URI = 'mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/'
client = pymongo.MongoClient(MONGODB_URI)
db = client['DBLEONI']

# Exemple de locations à insérer
locations = [
    {"nom": "Messasdine"},
    {"nom": "Sousse"},
    {"nom": "Tunis"},
    {"nom": "Monastir"}
]

result = db['location'].insert_many(locations)
print(f"{len(result.inserted_ids)} locations insérées.")
