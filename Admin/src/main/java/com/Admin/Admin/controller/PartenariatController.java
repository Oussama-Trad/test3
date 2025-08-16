package com.Admin.Admin.controller;

import com.Admin.Admin.model.Partenariat;
import com.Admin.Admin.repository.PartenariatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/partenariats")
public class PartenariatController {
    @Autowired
    private PartenariatRepository partenariatRepository;

    @GetMapping("")
    public String list(Model model, @RequestParam(required = false) String type, @RequestParam(required = false) String titre) {
        List<Partenariat> partenariats;
        if (type != null && !type.isEmpty()) {
            partenariats = partenariatRepository.findByType(type);
        } else if (titre != null && !titre.isEmpty()) {
            partenariats = partenariatRepository.findByTitreContainingIgnoreCase(titre);
        } else {
            partenariats = partenariatRepository.findAll();
        }
        model.addAttribute("partenariats", partenariats);
        return "partenariats/list";
    }

    @GetMapping("/create")
    public String createForm(Model model) {
        model.addAttribute("partenariat", new Partenariat());
        return "partenariats/form";
    }

    @PostMapping("/create")
    public String create(@ModelAttribute Partenariat partenariat) {
        partenariatRepository.save(partenariat);
        return "redirect:/partenariats";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable String id, Model model) {
        Optional<Partenariat> opt = partenariatRepository.findById(id);
        if (opt.isPresent()) {
            model.addAttribute("partenariat", opt.get());
            return "partenariats/form";
        }
        return "redirect:/partenariats";
    }

    @PostMapping("/edit/{id}")
    public String edit(@PathVariable String id, @ModelAttribute Partenariat partenariat) {
        partenariat.setId(id);
        partenariatRepository.save(partenariat);
        return "redirect:/partenariats";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable String id) {
        partenariatRepository.deleteById(id);
        return "redirect:/partenariats";
    }
}
