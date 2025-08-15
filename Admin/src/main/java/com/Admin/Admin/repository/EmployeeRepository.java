package com.Admin.Admin.repository;

import com.Admin.Admin.model.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface EmployeeRepository extends MongoRepository<Employee, String> {
    List<Employee> findByLocationIdAndDepartementId(String locationId, String departementId);
}
