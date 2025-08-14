// Script Node.js pour créer la collection document_requests et insérer des demandes de test
// À exécuter avec: node mongodb-documentRequest-init.js

const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('DBLEONI');

    // Création de la collection si elle n'existe pas
    await db.createCollection('document_requests').catch(() => {});

    // Insertion de demandes de test
    await db.collection('document_requests').deleteMany({});
    await db.collection('document_requests').insertMany([
      {
  departmentId: new ObjectId('64d9e1f2a1b2c3d4e5f6a7d1'), // Remplacer par un vrai ObjectId de département
  locationId: new ObjectId('64d9e1f2a1b2c3d4e5f6a7d2'),   // Remplacer par un vrai ObjectId de localisation
  employeeId: new ObjectId('64d9e1f2a1b2c3d4e5f6a7c9'),   // Remplacer par un vrai ObjectId d'employé
  documentTypeId: new ObjectId('64d9e1f2a1b2c3d4e5f6a7b8'), // Remplacer par un vrai ObjectId de DocumentType
        status: 'En attente', // En attente, En cours, Accepté, Refusé
        createdAt: new Date(),
        commentaire: 'Demande de document test.'
      },
      {
  departmentId: new ObjectId('64d9e1f2a1b2c3d4e5f6a7d1'),
  locationId: new ObjectId('64d9e1f2a1b2c3d4e5f6a7d2'),
  employeeId: new ObjectId('64d9e1f2a1b2c3d4e5f6a7c9'),
  documentTypeId: new ObjectId('64d9e1f2a1b2c3d4e5f6a7b9'),
        status: 'Accepté',
        createdAt: new Date(),
        commentaire: 'Demande acceptée.'
      }
    ]);

    console.log('Collection document_requests créée et demandes insérées !');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
