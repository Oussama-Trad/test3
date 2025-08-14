package com.Admin.Admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "departement")
public class Departement {
    @Id
    private String id;
    private String nom;
    private String locationId;

    public Departement() {}

    public Departement(String nom, String locationId) {
        this.nom = nom;
        this.locationId = locationId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }
}
