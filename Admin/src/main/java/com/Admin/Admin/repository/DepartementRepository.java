package com.Admin.Admin.repository;

import com.Admin.Admin.model.Departement;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DepartementRepository extends MongoRepository<Departement, String> {
    List<Departement> findByLocationId(String locationId);
}
