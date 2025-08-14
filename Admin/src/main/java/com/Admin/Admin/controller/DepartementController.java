package com.Admin.Admin.controller;

import com.Admin.Admin.model.Departement;
import com.Admin.Admin.repository.DepartementRepository;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/departements")
@CrossOrigin(origins = "*")
public class DepartementController {

    @Autowired
    private DepartementRepository departementRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping
    public ResponseEntity<?> getDepartementsByLocation(@RequestParam(required = false) String locationId) {
        if (locationId == null || locationId.equals("all")) {
            List<Departement> all = departementRepository.findAll();
            return ResponseEntity.ok(all);
        } else {
            // On filtre côté Java pour supporter ObjectId ou String
            List<Departement> all = departementRepository.findAll();
            List<Departement> filtered = all.stream()
                .filter(dep -> locationId.equals(dep.getLocationId()) ||
                              locationId.equals(String.valueOf(dep.getLocationId())))
                .toList();
            return ResponseEntity.ok(filtered);
        }
    }

    @GetMapping("/byLocation/{locationId}")
    public List<Departement> getDepartementsByLocationId(@PathVariable String locationId) {
        Query query = new Query();
        // On matche à la fois String et ObjectId
        Criteria criteria = new Criteria().orOperator(
            Criteria.where("locationId").is(locationId),
            Criteria.where("locationId").is(new ObjectId(locationId))
        );
        query.addCriteria(criteria);
        return mongoTemplate.find(query, Departement.class);
    }
}
