package com.Admin.Admin.controller;

import com.Admin.Admin.model.Admin;
import com.Admin.Admin.model.SuperAdmin;
import com.Admin.Admin.repository.AdminRepository;
import com.Admin.Admin.repository.SuperAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private SuperAdminRepository superAdminRepository;

    @GetMapping("/{role}/{id}")
    public ResponseEntity<?> getProfile(@PathVariable String role, @PathVariable String id) {
        if (role.equals("superadmin")) {
            Optional<SuperAdmin> superAdmin = superAdminRepository.findById(id);
            return superAdmin.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } else {
            Optional<Admin> admin = adminRepository.findById(id);
            return admin.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        }
    }

    @PutMapping("/{role}/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable String role, @PathVariable String id, @RequestBody Map<String, String> body) {
        if (role.equals("superadmin")) {
            Optional<SuperAdmin> superAdminOpt = superAdminRepository.findById(id);
            if (superAdminOpt.isPresent()) {
                SuperAdmin superAdmin = superAdminOpt.get();
                if (body.containsKey("nom")) superAdmin.setNom(body.get("nom"));
                if (body.containsKey("prenom")) superAdmin.setPrenom(body.get("prenom"));
                if (body.containsKey("adresse")) superAdmin.setAdresse(body.get("adresse"));
                if (body.containsKey("numTel")) superAdmin.setNumTel(body.get("numTel"));
                if (body.containsKey("email")) superAdmin.setEmail(body.get("email"));
                superAdminRepository.save(superAdmin);
                return ResponseEntity.ok(superAdmin);
            }
        } else {
            Optional<Admin> adminOpt = adminRepository.findById(id);
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                if (body.containsKey("nom")) admin.setNom(body.get("nom"));
                if (body.containsKey("prenom")) admin.setPrenom(body.get("prenom"));
                if (body.containsKey("adresse")) admin.setAdresse(body.get("adresse"));
                if (body.containsKey("numTel")) admin.setNumTel(body.get("numTel"));
                if (body.containsKey("location")) admin.setLocation(body.get("location"));
                if (body.containsKey("departement")) admin.setDepartement(body.get("departement"));
                if (body.containsKey("email")) admin.setEmail(body.get("email"));
                adminRepository.save(admin);
                return ResponseEntity.ok(admin);
            }
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Profil non trouvé");
        return ResponseEntity.status(404).body(error);
    }
}
