package com.Admin.Admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "documentType")
public class DocumentType {
    @Id
    private String id;
    private String titre;
    private String description;
    private LocalDateTime dateCreation;
    private String createdBy;

    public DocumentType() {}

    public DocumentType(String titre, String description, LocalDateTime dateCreation, String createdBy) {
        this.titre = titre;
        this.description = description;
        this.dateCreation = dateCreation;
        this.createdBy = createdBy;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
