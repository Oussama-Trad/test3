# Création de la collection messages (MongoDB)
# Ce script est à exécuter une seule fois si besoin, sinon la collection sera créée automatiquement lors du premier insert.


import pymongo
from datetime import datetime

# Connexion MongoDB identique au reste du projet
MONGODB_URI = 'mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/'
client = pymongo.MongoClient(MONGODB_URI)
db = client['DBLEONI']

# Exemple d'insertion d'un message (décommentez pour tester)
def create_message(senderId, receiverId, message):
    db.messages.insert_one({
        'senderId': senderId,
        'receiverId': receiverId,
        'message': message,
        'timestamp': datetime.utcnow(),
        'read': False
    })

# create_message('employeId', 'adminId', 'Bonjour !')
