package com.Admin.Admin.config;

import com.Admin.Admin.model.DocumentType;
import com.Admin.Admin.repository.DocumentTypeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;

@Configuration
public class DocumentTypeDataLoader {
    @Bean
    CommandLineRunner initDocumentTypes(DocumentTypeRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(new DocumentType("Attestation de travail", "Document officiel attestant l'emploi.", LocalDateTime.now(), "system"));
                repo.save(new DocumentType("Demande de salaire", "Demande d'attestation de salaire.", LocalDateTime.now(), "system"));
                repo.save(new DocumentType("Demande de congé", "Demande d'autorisation d'absence.", LocalDateTime.now(), "system"));
            }
        };
    }
}
