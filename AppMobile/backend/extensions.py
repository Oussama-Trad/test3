from pymongo import MongoClient

MONGODB_URI = 'mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/'
client = MongoClient(MONGODB_URI)
db = client['DBLEONI']

employee_collection = db['employee']
location_collection = db['location']
departement_collection = db['departement']
