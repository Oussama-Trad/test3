// Script Node.js pour initialiser la base DBLEONI et les collections
// À exécuter avec: node mongodb-init.js

const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('DBLEONI');

    // Création des collections si elles n'existent pas
    await db.createCollection('employee').catch(() => {});
    await db.createCollection('admin').catch(() => {});
    await db.createCollection('superadmin').catch(() => {});
    await db.createCollection('location').catch(() => {});
    await db.createCollection('departement').catch(() => {});

    // Insert locations
    const locations = [
      { nom: 'Mater' },
      { nom: 'Messasdine' },
      { nom: 'Sousse' },
      { nom: 'Tunis' }
    ];
    await db.collection('location').deleteMany({});
    const locResult = await db.collection('location').insertMany(locations);

    // Insert departements
    const locs = await db.collection('location').find().toArray();
    const getLocId = name => locs.find(l => l.nom === name)._id;
    const departements = [
      { nom: 'Production', locationId: getLocId('Mater') },
      { nom: 'Logistique', locationId: getLocId('Mater') },
      { nom: 'Qualité', locationId: getLocId('Mater') },
      { nom: 'R&D', locationId: getLocId('Messasdine') },
      { nom: 'IT', locationId: getLocId('Messasdine') },
      { nom: 'Maintenance', locationId: getLocId('Messasdine') },
      { nom: 'Production', locationId: getLocId('Sousse') },
      { nom: 'Support', locationId: getLocId('Sousse') },
      { nom: 'Finance', locationId: getLocId('Sousse') },
      { nom: 'R&D', locationId: getLocId('Tunis') },
      { nom: 'Marketing', locationId: getLocId('Tunis') },
      { nom: 'Ressources Humaines', locationId: getLocId('Tunis') }
    ];
    await db.collection('departement').deleteMany({});
    await db.collection('departement').insertMany(departements);

    console.log('Base DBLEONI et collections initialisées avec succès !');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
