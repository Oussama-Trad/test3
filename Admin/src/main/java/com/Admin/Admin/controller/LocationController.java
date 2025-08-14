package com.Admin.Admin.controller;

import com.Admin.Admin.model.Location;
import com.Admin.Admin.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*")
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    @GetMapping
    public ResponseEntity<?> getAllLocations() {
        List<Location> locations = locationRepository.findAll();
        return ResponseEntity.ok().body(locations);
    }
}
