package com.Admin.Admin.controller;

import com.Admin.Admin.model.Reclamation;
import com.Admin.Admin.repository.ReclamationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/reclamations")
public class ReclamationController {
    @Autowired
    private ReclamationRepository reclamationRepository;

    @GetMapping("")
    public String listReclamations(Model model) {
        List<Reclamation> reclamations = reclamationRepository.findAll();
        model.addAttribute("reclamations", reclamations);
        return "reclamations/list";
    }

    @GetMapping("/edit/{id}")
    public String editReclamation(@PathVariable String id, Model model) {
        Optional<Reclamation> reclamation = reclamationRepository.findById(id);
        if (reclamation.isPresent()) {
            model.addAttribute("reclamation", reclamation.get());
            return "reclamations/edit";
        } else {
            return "redirect:/reclamations";
        }
    }

    @PostMapping("/update/{id}")
    public String updateReclamation(@PathVariable String id, @RequestParam String statut) {
        Optional<Reclamation> reclamationOpt = reclamationRepository.findById(id);
        if (reclamationOpt.isPresent()) {
            Reclamation reclamation = reclamationOpt.get();
            reclamation.setStatut(statut);
            reclamationRepository.save(reclamation);
        }
        return "redirect:/reclamations";
    }
}
