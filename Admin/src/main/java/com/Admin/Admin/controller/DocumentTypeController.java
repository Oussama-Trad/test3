package com.Admin.Admin.controller;

import com.Admin.Admin.model.DocumentType;
import com.Admin.Admin.repository.DocumentTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/document-types")
@CrossOrigin(origins = "*")
public class DocumentTypeController {
    @Autowired
    private DocumentTypeRepository documentTypeRepository;

    @GetMapping
    public List<DocumentType> getAll() {
        return documentTypeRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<DocumentType> getById(@PathVariable String id) {
        return documentTypeRepository.findById(id);
    }

    @PostMapping
    public DocumentType create(@RequestBody DocumentType documentType) {
        documentType.setDateCreation(LocalDateTime.now());
        return documentTypeRepository.save(documentType);
    }

    @PutMapping("/{id}")
    public DocumentType update(@PathVariable String id, @RequestBody DocumentType documentType) {
        documentType.setId(id);
        return documentTypeRepository.save(documentType);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        documentTypeRepository.deleteById(id);
    }
}
