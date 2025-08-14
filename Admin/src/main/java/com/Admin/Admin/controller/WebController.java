
package com.Admin.Admin.controller;

import com.Admin.Admin.model.Admin;
import com.Admin.Admin.model.SuperAdmin;
import com.Admin.Admin.repository.AdminRepository;
import com.Admin.Admin.repository.SuperAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.Optional;

@Controller
public class WebController {
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private SuperAdminRepository superAdminRepository;
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @GetMapping("/")
    public String rootRedirect(HttpSession session) {
        Object user = session.getAttribute("user");
        if (user != null) {
            return "redirect:/profile";
        } else {
            return "redirect:/login";
        }
    }

    @GetMapping("/register")
    public String showRegister() { return "register"; }

    @PostMapping("/register")
    public String register(@RequestParam String nom, @RequestParam String prenom, @RequestParam String adresse,
                          @RequestParam String numTel, @RequestParam String location, @RequestParam String departement,
                          @RequestParam String email, @RequestParam String password, @RequestParam String role, Model model) {
        if (role.equals("superadmin")) {
            SuperAdmin superAdmin = new SuperAdmin(nom, prenom, adresse, numTel, email, passwordEncoder.encode(password));
            superAdminRepository.save(superAdmin);
        } else {
            Admin admin = new Admin(nom, prenom, adresse, numTel, location, departement, email, passwordEncoder.encode(password));
            adminRepository.save(admin);
        }
        model.addAttribute("success", true);
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String showLogin() { return "login"; }

    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password, HttpSession session, Model model) {
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent() && passwordEncoder.matches(password, adminOpt.get().getPassword())) {
            session.setAttribute("user", adminOpt.get());
            session.setAttribute("role", "admin");
            return "redirect:/profile";
        }
        Optional<SuperAdmin> superAdminOpt = superAdminRepository.findByEmail(email);
        if (superAdminOpt.isPresent() && passwordEncoder.matches(password, superAdminOpt.get().getPassword())) {
            session.setAttribute("user", superAdminOpt.get());
            session.setAttribute("role", "superadmin");
            return "redirect:/profile";
        }
        model.addAttribute("error", "Identifiants invalides");
        return "login";
    }

    @GetMapping("/profile")
    public String showProfile(HttpSession session, Model model) {
        Object user = session.getAttribute("user");
        System.out.println("[DEBUG] user en session: " + user);
        if (user != null) {
            System.out.println("[DEBUG] user class: " + user.getClass().getName());
        } else {
            System.out.println("[DEBUG] Aucun user en session");
        }
        model.addAttribute("user", user);
        return "profile";
    }

    @PostMapping("/profile")
    public String updateProfile(@RequestParam String nom, @RequestParam String prenom, @RequestParam String adresse,
                               @RequestParam String numTel, @RequestParam(required = false) String location,
                               @RequestParam(required = false) String departement, @RequestParam String email,
                               HttpSession session, Model model) {
        String role = (String) session.getAttribute("role");
        if (role == null) return "redirect:/login";
        if (role.equals("superadmin")) {
            SuperAdmin user = (SuperAdmin) session.getAttribute("user");
            user.setNom(nom); user.setPrenom(prenom); user.setAdresse(adresse); user.setNumTel(numTel); user.setEmail(email);
            superAdminRepository.save(user);
            session.setAttribute("user", user);
        } else {
            Admin user = (Admin) session.getAttribute("user");
            user.setNom(nom); user.setPrenom(prenom); user.setAdresse(adresse); user.setNumTel(numTel);
            user.setLocation(location); user.setDepartement(departement); user.setEmail(email);
            adminRepository.save(user);
            session.setAttribute("user", user);
        }
        model.addAttribute("user", session.getAttribute("user"));
        model.addAttribute("success", true);
        return "profile";
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}
