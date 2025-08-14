package com.Admin.Admin.controller;

import com.Admin.Admin.model.Departement;
import com.Admin.Admin.repository.DepartementRepository;
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
}
