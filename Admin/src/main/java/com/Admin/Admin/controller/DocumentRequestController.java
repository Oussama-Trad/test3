package com.Admin.Admin.controller;

import com.Admin.Admin.model.DocumentRequest;
import com.Admin.Admin.repository.DocumentRequestRepository;
import com.Admin.Admin.model.Admin;
import com.Admin.Admin.model.SuperAdmin;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/document-requests")
public class DocumentRequestController {
    @Autowired
    private DocumentRequestRepository documentRequestRepository;

    @GetMapping("")
    public String listRequests(HttpSession session, Model model) {
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        List<DocumentRequest> requests;
        if (user == null) {
            return "redirect:/login";
        }
        if ("superadmin".equals(role)) {
            requests = documentRequestRepository.findAll();
        } else if (user instanceof Admin) {
            Admin admin = (Admin) user;
            requests = documentRequestRepository.findByLocationIdAndDepartmentId(admin.getLocation(), admin.getDepartement());
        } else {
            requests = List.of();
        }
        model.addAttribute("requests", requests);
        model.addAttribute("role", role);
        return "documentRequests/list";
    }

    @PostMapping("/update-status/{id}")
    public String updateStatus(@PathVariable String id, @RequestParam String status) {
        Optional<DocumentRequest> reqOpt = documentRequestRepository.findById(id);
        if (reqOpt.isPresent()) {
            DocumentRequest req = reqOpt.get();
            req.setStatus(status);
            documentRequestRepository.save(req);
        }
        return "redirect:/document-requests";
    }
}
