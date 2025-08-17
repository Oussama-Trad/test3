package com.Admin.Admin.repository;

import com.Admin.Admin.model.Reclamation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReclamationRepository extends MongoRepository<Reclamation, String> {
    List<Reclamation> findByStatut(String statut);
    List<Reclamation> findByEmployeId(String employeId);
}
