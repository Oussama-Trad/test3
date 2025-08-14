package com.Admin.Admin.repository;

import com.Admin.Admin.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AdminRepository extends MongoRepository<Admin, String> {
    Optional<Admin> findByEmail(String email);
    Optional<Admin> findByNumTel(String numTel);
    boolean existsByEmail(String email);
    boolean existsByNumTel(String numTel);
}
