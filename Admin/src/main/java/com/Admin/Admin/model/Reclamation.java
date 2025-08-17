package com.Admin.Admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "reclamations")
public class Reclamation {
    @Id
    private String id;
    private String titre;
    private String description;
    private String piece_jointe;
    private String statut;
    private String employeId;
    private String locationId;
    private String departementId;
    private String date;

    // Getters et setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPiece_jointe() { return piece_jointe; }
    public void setPiece_jointe(String piece_jointe) { this.piece_jointe = piece_jointe; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public String getEmployeId() { return employeId; }
    public void setEmployeId(String employeId) { this.employeId = employeId; }
    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }
    public String getDepartementId() { return departementId; }
    public void setDepartementId(String departementId) { this.departementId = departementId; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
