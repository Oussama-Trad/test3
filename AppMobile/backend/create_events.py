import pymongo
from datetime import datetime

MONGODB_URI = 'mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/'
client = pymongo.MongoClient(MONGODB_URI)
db = client['DBLEONI']

events = [
    {
        "title": "Séminaire annuel",
        "description": "Séminaire annuel de l'entreprise avec ateliers et conférences.",
        "photo": "seminaire.jpg",
        "startDate": datetime(2025, 9, 10, 9, 0),
        "endDate": datetime(2025, 9, 10, 18, 0),
        "locationId": "all",
        "departementId": "all",
        "createdBy": "superadmin_id",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "title": "Afterwork RH",
        "description": "Afterwork pour le département RH.",
        "photo": "afterwork.jpg",
        "startDate": datetime(2025, 10, 5, 18, 0),
        "endDate": None,
        "locationId": "689db938e7e67dbfe889453a",
        "departementId": "689db938e7e67dbfe8894541",
        "createdBy": "admin_id",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

result = db['event'].insert_many(events)
print(f"{len(result.inserted_ids)} événements insérés.")
