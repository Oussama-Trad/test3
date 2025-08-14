package com.Admin.Admin.repository;

import com.Admin.Admin.model.DocumentRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DocumentRequestRepository extends MongoRepository<DocumentRequest, String> {
    List<DocumentRequest> findByLocationIdAndDepartmentId(String locationId, String departmentId);
    List<DocumentRequest> findByLocationId(String locationId);
    List<DocumentRequest> findByDepartmentId(String departmentId);
}
