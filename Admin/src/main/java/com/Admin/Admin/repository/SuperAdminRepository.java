package com.Admin.Admin.repository;

import com.Admin.Admin.model.SuperAdmin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SuperAdminRepository extends MongoRepository<SuperAdmin, String> {
    Optional<SuperAdmin> findByEmail(String email);
    Optional<SuperAdmin> findByNumTel(String numTel);
    boolean existsByEmail(String email);
    boolean existsByNumTel(String numTel);
}
