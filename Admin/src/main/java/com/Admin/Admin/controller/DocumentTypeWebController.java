package com.Admin.Admin.controller;

import com.Admin.Admin.model.DocumentType;
import com.Admin.Admin.repository.DocumentTypeRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Optional;

@Controller
@RequestMapping("/document-types")
public class DocumentTypeWebController {
    @Autowired
    private DocumentTypeRepository documentTypeRepository;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("documentTypes", documentTypeRepository.findAll());
        return "documentTypes/list";
    }

    @GetMapping("/create")
    public String showCreateForm(Model model) {
        model.addAttribute("documentType", new DocumentType());
        return "documentTypes/create";
    }

    @PostMapping
    public String create(@ModelAttribute DocumentType documentType, HttpSession session) {
        documentType.setDateCreation(LocalDateTime.now());
        Object user = session.getAttribute("user");
        if (user != null && user instanceof com.Admin.Admin.model.Admin admin) {
            documentType.setCreatedBy(admin.getNom());
        } else {
            documentType.setCreatedBy("system");
        }
        documentTypeRepository.save(documentType);
        return "redirect:/document-types";
    }

    @GetMapping("/{id}/edit")
    public String showEditForm(@PathVariable String id, Model model) {
        Optional<DocumentType> docType = documentTypeRepository.findById(id);
        if (docType.isPresent()) {
            model.addAttribute("documentType", docType.get());
            return "documentTypes/edit";
        }
        return "redirect:/document-types";
    }

    @PostMapping("/{id}/edit")
    public String update(@PathVariable String id, @ModelAttribute DocumentType documentType) {
        documentType.setId(id);
        documentTypeRepository.save(documentType);
        return "redirect:/document-types";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable String id) {
        documentTypeRepository.deleteById(id);
        return "redirect:/document-types";
    }
}
