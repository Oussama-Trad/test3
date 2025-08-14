package com.Admin.Admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "employee")
public class Employee {
    @Id
    private String id;
    private String nom;
    private String prenom;
    private String adresse1;
    private String adresse2;
    private String numTel;
    private String numTelParentale;
    private String location;
    private String departement;
    private String photoDeProfil = "";
    private Date createdAt;
    private Date updatedAt;
    // Pas de champ password ici

    public Employee() {}

    // plus de get/set _id
    public String getNom() {
        return nom;
    }
    public void setNom(String nom) {
        this.nom = nom;
    }
    public String getPrenom() {
        return prenom;
    }
    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getAdresse1() {
        return adresse1;
    }
    public void setAdresse1(String adresse1) {
        this.adresse1 = adresse1;
    }
    public String getAdresse2() {
        return adresse2;
    }
    public void setAdresse2(String adresse2) {
        this.adresse2 = adresse2;
    }
    public String getNumTel() {
        return numTel;
    }
    public void setNumTel(String numTel) {
        this.numTel = numTel;
    }
    public String getNumTelParentale() {
        return numTelParentale;
    }
    public void setNumTelParentale(String numTelParentale) {
        this.numTelParentale = numTelParentale;
    }
    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }
    public String getDepartement() {
        return departement;
    }
    public void setDepartement(String departement) {
        this.departement = departement;
    }
    public String getPhotoDeProfil() {
        return photoDeProfil;
    }
    public void setPhotoDeProfil(String photoDeProfil) {
        this.photoDeProfil = photoDeProfil;
    }
    public Date getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    public Date getUpdatedAt() {
        return updatedAt;
    }
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}
