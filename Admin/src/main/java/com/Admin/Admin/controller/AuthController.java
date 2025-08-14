package com.Admin.Admin.controller;

import com.Admin.Admin.model.Admin;
import com.Admin.Admin.model.SuperAdmin;
import com.Admin.Admin.repository.AdminRepository;
import com.Admin.Admin.repository.SuperAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private SuperAdminRepository superAdminRepository;
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String role = body.getOrDefault("role", "admin");
        if (role.equals("superadmin")) {
            SuperAdmin superAdmin = new SuperAdmin(
                body.get("nom"), body.get("prenom"), body.get("adresse"),
                body.get("numTel"), body.get("email"), passwordEncoder.encode(body.get("password"))
            );
            superAdminRepository.save(superAdmin);
            return ResponseEntity.ok(superAdmin);
        } else {
            Admin admin = new Admin(
                body.get("nom"), body.get("prenom"), body.get("adresse"), body.get("numTel"),
                body.get("location"), body.get("departement"), body.get("email"), passwordEncoder.encode(body.get("password"))
            );
            adminRepository.save(admin);
            return ResponseEntity.ok(admin);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent() && passwordEncoder.matches(password, adminOpt.get().getPassword())) {
            return ResponseEntity.ok(adminOpt.get());
        }
        Optional<SuperAdmin> superAdminOpt = superAdminRepository.findByEmail(email);
        if (superAdminOpt.isPresent() && passwordEncoder.matches(password, superAdminOpt.get().getPassword())) {
            return ResponseEntity.ok(superAdminOpt.get());
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Identifiants invalides");
        return ResponseEntity.status(401).body(error);
    }
}
