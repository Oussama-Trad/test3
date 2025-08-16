package com.Admin.Admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "leaveRequests")
public class LeaveRequest {
    @Id
    private String id;
    private String employeeId;
    private String employeeNom;
    private String employeePrenom;
    private String locationId;
    private String locationNom;
    private String departementId;
    private String departementNom;
    private String type;
    private String startDate;
    private String endDate;
    private String status;
    private Date createdAt;
    private Date updatedAt;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getEmployeeNom() { return employeeNom; }
    public void setEmployeeNom(String employeeNom) { this.employeeNom = employeeNom; }
    public String getEmployeePrenom() { return employeePrenom; }
    public void setEmployeePrenom(String employeePrenom) { this.employeePrenom = employeePrenom; }
    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }
    public String getLocationNom() { return locationNom; }
    public void setLocationNom(String locationNom) { this.locationNom = locationNom; }
    public String getDepartementId() { return departementId; }
    public void setDepartementId(String departementId) { this.departementId = departementId; }
    public String getDepartementNom() { return departementNom; }
    public void setDepartementNom(String departementNom) { this.departementNom = departementNom; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
