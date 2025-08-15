package com.Admin.Admin.repository;

import com.Admin.Admin.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Date;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByLocationIdAndDepartementId(String locationId, String departementId);
    List<Event> findByLocationId(String locationId);
    List<Event> findByDepartementId(String departementId);
    List<Event> findByCreatedBy(String createdBy);
    List<Event> findByStartDateBetween(Date start, Date end);
}
