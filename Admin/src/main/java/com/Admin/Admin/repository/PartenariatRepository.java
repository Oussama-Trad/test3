package com.Admin.Admin.repository;

import com.Admin.Admin.model.Partenariat;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PartenariatRepository extends MongoRepository<Partenariat, String> {
    List<Partenariat> findByType(String type);
    List<Partenariat> findByTitreContainingIgnoreCase(String titre);
}
