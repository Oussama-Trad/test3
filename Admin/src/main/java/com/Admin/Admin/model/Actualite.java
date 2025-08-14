package com.Admin.Admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "actualite")
public class Actualite {
    @Id
    private String id;
    private String titre;
    private String description;
    private String photo;
    private String locationId;
    private String departementId;

    public Actualite() {}

    public Actualite(String titre, String description, String photo, String locationId, String departementId) {
        this.titre = titre;
        this.description = description;
        this.photo = photo;
        this.locationId = locationId;
        this.departementId = departementId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }
    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }
    public String getDepartementId() { return departementId; }
    public void setDepartementId(String departementId) { this.departementId = departementId; }
}
