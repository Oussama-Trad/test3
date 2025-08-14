// Modèle Employee pour validation côté front (optionnel)
export default class Employee {
  constructor({ id, nom, prenom, adresse1, adresse2, numTel, numTelParentale, location, departement, photoDeProfil }) {
    this.id = id;
    this.nom = nom;
    this.prenom = prenom;
    this.adresse1 = adresse1;
    this.adresse2 = adresse2;
    this.numTel = numTel;
    this.numTelParentale = numTelParentale;
    this.location = location;
    this.departement = departement;
    this.photoDeProfil = photoDeProfil;
  }
}
