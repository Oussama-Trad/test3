package com.Admin.Admin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.*;
import org.bson.types.ObjectId;
import com.Admin.Admin.model.*;
import com.Admin.Admin.repository.*;
import com.Admin.Admin.service.MessageService;
import org.bson.Document;

@Controller
@RequestMapping("/messages")
public class MessageController {
    @Autowired
    private org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private SuperAdminRepository superAdminRepository;

    @Autowired
    private MessageService messageService;

    // Affiche la liste des conversations
    @GetMapping("")

    public String listConversations(Model model, HttpSession session) {
        // Exemple : récupération de l'admin connecté
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        Admin admin = (role != null && role.equals("admin")) ? (Admin) user : null;
        SuperAdmin superAdmin = (role != null && role.equals("superadmin")) ? (SuperAdmin) user : null;
        boolean isSuperAdmin = (superAdmin != null);
        String adminId = isSuperAdmin ? superAdmin.getId() : (admin != null ? admin.getId() : null);
        String location = isSuperAdmin ? null : (admin != null ? admin.getLocation() : null);
        String departement = isSuperAdmin ? null : (admin != null ? admin.getDepartement() : null);
        if (adminId == null) return "redirect:/login";

        List<Document> convDocs = messageService.getConversationsForAdmin(adminId, location, departement, isSuperAdmin);
        System.out.println("[DEBUG] convDocs size: " + (convDocs != null ? convDocs.size() : "null"));
        if (convDocs != null) {
            for (Document d : convDocs) {
                System.out.println("[DEBUG] convDoc: " + d.toJson());
            }
        }

        // LOG: Afficher tous les employés (id et _id)
        List<Employee> allEmployees = mongoTemplate.findAll(Employee.class);
        System.out.println("[DUMP] Liste des employés dans la collection employee:");
        for (Employee emp : allEmployees) {
            System.out.println("[DUMP] Employee: id=" + emp.getId());
        }

        List<Map<String, Object>> conversations = new ArrayList<>();
        for (Document doc : convDocs) {
            String employeeId = doc.getString("_id");
            System.out.println("[DEBUG] Looking up employee for id: " + employeeId);
            Employee employee = null;
            // 1. Recherche par _id (ObjectId)
            if (employeeId != null && employeeId.matches("^[a-fA-F0-9]{24}$")) {
                try {
                    org.springframework.data.mongodb.core.query.Query query = new org.springframework.data.mongodb.core.query.Query();
                    query.addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("_id").is(new org.bson.types.ObjectId(employeeId)));
                    employee = mongoTemplate.findOne(query, Employee.class);
                    if (employee != null) {
                        System.out.println("[DEBUG] Found employee by _id: " + employee);
                    }
                } catch (Exception e) {
                    System.out.println("[DEBUG] Exception during ObjectId lookup: " + e.getMessage());
                }
            }
            // 2. Recherche par champ 'customId' (champ 'id' dans MongoDB)
            if (employee == null) {
                try {
                    org.springframework.data.mongodb.core.query.Query query2 = new org.springframework.data.mongodb.core.query.Query();
                    query2.addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("customId").is(employeeId));
                    employee = mongoTemplate.findOne(query2, Employee.class);
                    if (employee != null) {
                        System.out.println("[DEBUG] Found employee by champ 'customId': " + employee);
                    }
                } catch (Exception e) {
                    System.out.println("[DEBUG] Exception during champ 'customId' lookup: " + e.getMessage());
                }
            }
            if (employee == null) {
                System.out.println("[DEBUG] Employee not found for id or _id: " + employeeId);
                continue;
            }
            Map<String, Object> conv = new HashMap<>();
            conv.put("employee", employee);
            conv.put("lastMessage", doc.get("lastMessage"));
            conv.put("lastDate", doc.get("lastDate"));
            conversations.add(conv);
        }
        System.out.println("[DEBUG] conversations size: " + conversations.size());
        model.addAttribute("conversations", conversations);
        return "messages/conversations";
    }

    // Affiche le fil de discussion avec un employé
    @GetMapping("/{employeeId}")

    public String conversation(@PathVariable String employeeId, Model model, HttpSession session) {

    Object user = session.getAttribute("user");
    String role = (String) session.getAttribute("role");
    Admin admin = (role != null && role.equals("admin")) ? (Admin) user : null;
    SuperAdmin superAdmin = (role != null && role.equals("superadmin")) ? (SuperAdmin) user : null;
    boolean isSuperAdmin = (superAdmin != null);
    String adminId = isSuperAdmin ? superAdmin.getId() : (admin != null ? admin.getId() : null);
    if (adminId == null) return "redirect:/login";

        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) return "redirect:/messages";

        // TODO: Vérifier les droits d'accès si admin normal

        List<Document> messages = messageService.getMessagesWithEmployee(adminId, employeeId);
        model.addAttribute("employee", employee);
        model.addAttribute("messages", messages);
        return "messages/conversation";
    }

    // Envoi d'un message (POST)
    @PostMapping("/{employeeId}")

    public String sendMessage(@PathVariable String employeeId, @RequestParam String content, HttpSession session) {

    Object user = session.getAttribute("user");
    String role = (String) session.getAttribute("role");
    Admin admin = (role != null && role.equals("admin")) ? (Admin) user : null;
    SuperAdmin superAdmin = (role != null && role.equals("superadmin")) ? (SuperAdmin) user : null;
    String adminId = (superAdmin != null) ? superAdmin.getId() : (admin != null ? admin.getId() : null);
    if (adminId == null) return "redirect:/login";
    messageService.sendMessage(adminId, employeeId, content);
    return "redirect:/messages/" + employeeId;
    }
}
