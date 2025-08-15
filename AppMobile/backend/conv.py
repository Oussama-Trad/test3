from pymongo import MongoClient
from datetime import datetime

client = MongoClient('mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/')
db = client['DBLEONI']

# Exemple de création d'une conversation
conversation = {
    "participants": [
        {"type": "employee", "id": "09876543"},  # id court
        {"type": "admin", "id": "689dfcbd8efb018e752b0415"}
    ],
    "lastMessage": {
        "sender_id": "09876543",
        "content": "Salut !",
        "timestamp": datetime.utcnow()
    },
    "createdAt": datetime.utcnow(),
    "updatedAt": datetime.utcnow()
}

result = db.conversations.insert_one(conversation)
print("Conversation créée avec _id:", result.inserted_id)