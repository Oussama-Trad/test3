// MongoDB Script for creating collections and schemas for DBLEONI database
// Run this script in MongoDB shell or MongoDB Compass

use("DBLEONI");

// Create employee collection for mobile app
db.createCollection("employee", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nom", "prenom", "id", "adresse1", "numTel", "location", "departement", "photoDeProfil"],
      properties: {
        nom: {
          bsonType: "string",
          description: "Nom de l'employé"
        },
        prenom: {
          bsonType: "string",
          description: "Prénom de l'employé"
        },
        id: {
          bsonType: "string",
          pattern: "^[0-9]{8}$",
          description: "ID de l'employé - 8 chiffres"
        },
        adresse1: {
          bsonType: "string",
          description: "Adresse principale de l'employé"
        },
        adresse2: {
          bsonType: "string",
          description: "Complément d'adresse (optionnel)"
        },
        numTel: {
          bsonType: "string",
          description: "Numéro de téléphone de l'employé"
        },
        numTelParentale: {
          bsonType: "string",
          description: "Numéro de téléphone parentale"
        },
        location: {
          bsonType: "string",
          description: "Location de l'employé"
        },
        departement: {
          bsonType: "string",
          description: "Département de l'employé"
        },
        photoDeProfil: {
          bsonType: "string",
          description: "URL ou chemin de la photo de profil"
        },
        password: {
          bsonType: "string",
          description: "Mot de passe hashé"
        },
        createdAt: {
          bsonType: "date",
          description: "Date de création"
        },
        updatedAt: {
          bsonType: "date",
          description: "Date de mise à jour"
        }
      }
    }
  }
});

// Create admin collection for web admin
db.createCollection("admin", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nom", "prenom", "adresse", "numTel", "location", "departement", "email", "password"],
      properties: {
        nom: {
          bsonType: "string",
          description: "Nom de l'admin"
        },
        prenom: {
          bsonType: "string",
          description: "Prénom de l'admin"
        },
        adresse: {
          bsonType: "string",
          description: "Adresse de l'admin"
        },
        numTel: {
          bsonType: "string",
          description: "Numéro de téléphone de l'admin"
        },
        location: {
          bsonType: "string",
          description: "Location de l'admin"
        },
        departement: {
          bsonType: "string",
          description: "Département de l'admin"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email de l'admin"
        },
        password: {
          bsonType: "string",
          description: "Mot de passe hashé"
        },
        role: {
          bsonType: "string",
          enum: ["admin"],
          description: "Rôle fixe à 'admin'"
        },
        createdAt: {
          bsonType: "date",
          description: "Date de création"
        },
        updatedAt: {
          bsonType: "date",
          description: "Date de mise à jour"
        }
      }
    }
  }
});

// Create superadmin collection for web admin
db.createCollection("superadmin", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nom", "prenom", "adresse", "numTel", "email", "password"],
      properties: {
        nom: {
          bsonType: "string",
          description: "Nom du superadmin"
        },
        prenom: {
          bsonType: "string",
          description: "Prénom du superadmin"
        },
        adresse: {
          bsonType: "string",
          description: "Adresse du superadmin"
        },
        numTel: {
          bsonType: "string",
          description: "Numéro de téléphone du superadmin"
        },
        location: {
          bsonType: "string",
          enum: ["all"],
          description: "Location fixe à 'all'"
        },
        departement: {
          bsonType: "string",
          enum: ["all"],
          description: "Département fixe à 'all'"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email du superadmin"
        },
        password: {
          bsonType: "string",
          description: "Mot de passe hashé"
        },
        role: {
          bsonType: "string",
          enum: ["superadmin"],
          description: "Rôle fixe à 'superadmin'"
        },
        createdAt: {
          bsonType: "date",
          description: "Date de création"
        },
        updatedAt: {
          bsonType: "date",
          description: "Date de mise à jour"
        }
      }
    }
  }
});

// Create location collection
db.createCollection("location", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nom", "createdAt"],
      properties: {
        nom: {
          bsonType: "string",
          description: "Nom de la location"
        },
        createdAt: {
          bsonType: "date",
          description: "Date de création"
        }
      }
    }
  }
});

// Create departement collection
db.createCollection("departement", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nom", "locationId", "createdAt"],
      properties: {
        nom: {
          bsonType: "string",
          description: "Nom du département"
        },
        locationId: {
          bsonType: "objectId",
          description: "Référence à la location"
        },
        createdAt: {
          bsonType: "date",
          description: "Date de création"
        }
      }
    }
  }
});

// Create indexes for better performance
db.employee.createIndex({ "id": 1 }, { unique: true });
db.employee.createIndex({ "numTel": 1 }, { unique: true });
db.admin.createIndex({ "email": 1 }, { unique: true });
db.admin.createIndex({ "numTel": 1 }, { unique: true });
db.superadmin.createIndex({ "email": 1 }, { unique: true });
db.superadmin.createIndex({ "numTel": 1 }, { unique: true });
db.location.createIndex({ "nom": 1 }, { unique: true });
db.departement.createIndex({ "nom": 1, "locationId": 1 }, { unique: true });

// Insert locations and departments
const locations = [
  { nom: "Mater", createdAt: new Date() },
  { nom: "Messasdine", createdAt: new Date() },
  { nom: "Sousse", createdAt: new Date() },
  { nom: "Tunis", createdAt: new Date() }
];

const insertedLocations = {};
locations.forEach(location => {
  const result = db.location.insertOne(location);
  insertedLocations[location.nom] = result.insertedId;
});

// Insert departments for each location
const departments = [
  // Mater departments
  { nom: "Production", locationId: insertedLocations["Mater"], createdAt: new Date() },
  { nom: "Logistique", locationId: insertedLocations["Mater"], createdAt: new Date() },
  { nom: "Qualité", locationId: insertedLocations["Mater"], createdAt: new Date() },
  
  // Messasdine departments
  { nom: "R&D", locationId: insertedLocations["Messasdine"], createdAt: new Date() },
  { nom: "IT", locationId: insertedLocations["Messasdine"], createdAt: new Date() },
  { nom: "Maintenance", locationId: insertedLocations["Messasdine"], createdAt: new Date() },
  
  // Sousse departments
  { nom: "Production", locationId: insertedLocations["Sousse"], createdAt: new Date() },
  { nom: "Support", locationId: insertedLocations["Sousse"], createdAt: new Date() },
  { nom: "Finance", locationId: insertedLocations["Sousse"], createdAt: new Date() },
  
  // Tunis departments
  { nom: "R&D", locationId: insertedLocations["Tunis"], createdAt: new Date() },
  { nom: "Marketing", locationId: insertedLocations["Tunis"], createdAt: new Date() },
  { nom: "Ressources Humaines", locationId: insertedLocations["Tunis"], createdAt: new Date() }
];

departments.forEach(dept => {
  db.departement.insertOne(dept);
});

// Insert default superadmin (password: superadmin123)
db.superadmin.insertOne({
  nom: "Super",
  prenom: "Admin",
  adresse: "123 Rue Admin",
  numTel: "0123456789",
  email: "superadmin@leoni.com",
  password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6T0MWXoUAJGB6VI5e3ZxX3WLr.3W2", // bcrypt hash of "superadmin123"
  location: "all",
  departement: "all",
  role: "superadmin",
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Collections créées avec succès!");
print("Locations et départements insérés avec succès!");
