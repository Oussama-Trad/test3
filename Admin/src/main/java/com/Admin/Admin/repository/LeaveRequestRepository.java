package com.Admin.Admin.repository;

import com.Admin.Admin.model.LeaveRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    List<LeaveRequest> findByLocationIdAndDepartementId(String locationId, String departementId);
    List<LeaveRequest> findByLocationId(String locationId);
    List<LeaveRequest> findByDepartementId(String departementId);
}
