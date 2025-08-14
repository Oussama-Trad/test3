package com.Admin.Admin.repository;

import com.Admin.Admin.model.Actualite;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ActualiteRepository extends MongoRepository<Actualite, String> {
    List<Actualite> findByLocationId(String locationId);
    List<Actualite> findByDepartementId(String departementId);
    List<Actualite> findByLocationIdAndDepartementId(String locationId, String departementId);
    // Pour le superadmin : filtrage multiple
    List<Actualite> findByLocationIdIn(List<String> locationIds);
    List<Actualite> findByDepartementIdIn(List<String> departementIds);
}
