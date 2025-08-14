package com.Admin.Admin.repository;

import com.Admin.Admin.model.Location;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LocationRepository extends MongoRepository<Location, String> {
}
