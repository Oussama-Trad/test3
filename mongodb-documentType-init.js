// Script Node.js pour créer la collection documentType et insérer des types de documents de test
// À exécuter avec: node mongodb-documentType-init.js

const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('DBLEONI');

    // Création de la collection si elle n'existe pas
    await db.createCollection('documentType').catch(() => {});

    // Insertion de documents de test
    await db.collection('documentType').deleteMany({});
    await db.collection('documentType').insertMany([
      {
        titre: 'Attestation de travail',
        description: "Document officiel attestant l'emploi.",
        dateCreation: new Date(),
        createdBy: 'system'
      },
      {
        titre: 'Demande de salaire',
        description: "Demande d'attestation de salaire.",
        dateCreation: new Date(),
        createdBy: 'system'
      },
      {
        titre: 'Demande de congé',
        description: "Demande d'autorisation d'absence.",
        dateCreation: new Date(),
        createdBy: 'system'
      }
    ]);

    console.log('Collection documentType créée et documents insérés !');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
