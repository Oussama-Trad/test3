// Script de création de la collection documentType et insertion de documents de test

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // À adapter si besoin
const dbName = 'test3'; // À adapter selon le nom de ta base

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('documentType');
    // Création de la collection si elle n'existe pas
    await db.createCollection('documentType').catch(() => {});
    // Insertion de documents de test
    await collection.insertMany([
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
    console.log('Collection documentType créée et documents insérés.');
  } finally {
    await client.close();
  }
}

main().catch(console.error);
