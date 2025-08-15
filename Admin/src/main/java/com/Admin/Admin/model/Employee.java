package com.Admin.Admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "employee")
public class Employee {
    @Id
    private String id;
    @Field("id")
    private String customId; // correspond au champ 'id' dans MongoDB
    private String nom;
    private String prenom;
    private String adresse1;
    private String adresse2;
    private String numTel;
    private String numTelParentale;
    private String locationId;
    private String departementId;
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
    public String getCustomId() {
        return customId;
    }
    public void setCustomId(String customId) {
        this.customId = customId;
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
    public String getLocationId() {
        return locationId;
    }
    public void setLocationId(String locationId) {
        this.locationId = locationId;
    }
    public String getDepartementId() {
        return departementId;
    }
    public void setDepartementId(String departementId) {
        this.departementId = departementId;
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
