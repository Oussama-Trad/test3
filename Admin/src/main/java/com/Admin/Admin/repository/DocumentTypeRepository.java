package com.Admin.Admin.repository;

import com.Admin.Admin.model.DocumentType;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DocumentTypeRepository extends MongoRepository<DocumentType, String> {
}
