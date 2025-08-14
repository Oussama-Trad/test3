package com.Admin.Admin.controller;

import com.Admin.Admin.model.Actualite;
import com.Admin.Admin.model.Admin;
import com.Admin.Admin.model.SuperAdmin;
import com.Admin.Admin.model.Location;
import com.Admin.Admin.model.Departement;
import com.Admin.Admin.repository.ActualiteRepository;
import com.Admin.Admin.repository.LocationRepository;
import com.Admin.Admin.repository.DepartementRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;
import java.io.File;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@Controller
@RequestMapping("/actualites")
public class ActualiteController {
    @Autowired
    private ActualiteRepository actualiteRepository;
    @Autowired
    private LocationRepository locationRepository;
    @Autowired
    private DepartementRepository departementRepository;

    @GetMapping("")
    public String listActualites(HttpSession session, Model model,
                                 @RequestParam(required = false) String locationId,
                                 @RequestParam(required = false) String departementId) {
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        List<Actualite> actualites;
        List<Location> locations = locationRepository.findAll();
        List<Departement> departements = departementRepository.findAll();
        if (user == null) return "redirect:/login";
        if ("superadmin".equals(role)) {
            // Filtrage multi
            if (locationId != null && !locationId.isEmpty() && departementId != null && !departementId.isEmpty()) {
                actualites = actualiteRepository.findByLocationIdAndDepartementId(locationId, departementId);
            } else if (locationId != null && !locationId.isEmpty()) {
                actualites = actualiteRepository.findByLocationId(locationId);
            } else if (departementId != null && !departementId.isEmpty()) {
                actualites = actualiteRepository.findByDepartementId(departementId);
            } else {
                actualites = actualiteRepository.findAll();
            }
        } else if (user instanceof Admin admin) {
            actualites = actualiteRepository.findByLocationIdAndDepartementId(admin.getLocation(), admin.getDepartement());
        } else {
            actualites = List.of();
        }
        model.addAttribute("actualites", actualites);
        model.addAttribute("locations", locations);
        model.addAttribute("departements", departements);
        model.addAttribute("role", role);
        return "actualites/list";
    }

    @GetMapping("/create")
    public String showCreateForm(HttpSession session, Model model) {
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        List<Location> locations = locationRepository.findAll();
        List<Departement> departements = departementRepository.findAll();
        model.addAttribute("actualite", new Actualite());
        model.addAttribute("locations", locations);
        model.addAttribute("departements", departements);
        model.addAttribute("role", role);
        return "actualites/create";
    }

    @PostMapping("/create")
    public String createActualite(@ModelAttribute Actualite actualite,
                                  @RequestParam("photoFile") MultipartFile photoFile,
                                  HttpSession session) throws IOException {
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        if (user == null) return "redirect:/login";
        if (photoFile != null && !photoFile.isEmpty()) {
            String uploadsDir = "uploads/";
            String realPath = new File(uploadsDir).getAbsolutePath();
            File dir = new File(realPath);
            if (!dir.exists()) dir.mkdirs();
            String fileName = System.currentTimeMillis() + "_" + photoFile.getOriginalFilename();
            File dest = new File(dir, fileName);
            photoFile.transferTo(dest);
            actualite.setPhoto(fileName);
        }
        if ("superadmin".equals(role)) {
            // Superadmin peut choisir locationId et departementId (ou tous)
            if ((actualite.getLocationId() == null || actualite.getLocationId().isEmpty()) &&
                (actualite.getDepartementId() == null || actualite.getDepartementId().isEmpty())) {
                // Si rien n'est choisi, on ne poste pas
                return "redirect:/actualites?error=selection";
            }
        } else if (user instanceof Admin admin) {
            // Admin classique : impose sa location et département
            actualite.setLocationId(admin.getLocation());
            actualite.setDepartementId(admin.getDepartement());
        }
        actualiteRepository.save(actualite);
        return "redirect:/actualites";
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable String id, Model model, HttpSession session) {
        Optional<Actualite> actualiteOpt = actualiteRepository.findById(id);
        if (actualiteOpt.isEmpty()) return "redirect:/actualites";
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        List<Location> locations = locationRepository.findAll();
        List<Departement> departements = departementRepository.findAll();
        model.addAttribute("actualite", actualiteOpt.get());
        model.addAttribute("locations", locations);
        model.addAttribute("departements", departements);
        model.addAttribute("role", role);
        return "actualites/edit";
    }

    @PostMapping("/edit/{id}")
    public String editActualite(@PathVariable String id, @ModelAttribute Actualite actualite,
                                @RequestParam("photoFile") MultipartFile photoFile,
                                HttpSession session) throws IOException {
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        if (user == null) return "redirect:/login";
        Optional<Actualite> oldOpt = actualiteRepository.findById(id);
        if (oldOpt.isEmpty()) return "redirect:/actualites";
        Actualite old = oldOpt.get();
        old.setTitre(actualite.getTitre());
        old.setDescription(actualite.getDescription());
        if (photoFile != null && !photoFile.isEmpty()) {
            String uploadsDir = "uploads/";
            String realPath = new File(uploadsDir).getAbsolutePath();
            File dir = new File(realPath);
            if (!dir.exists()) dir.mkdirs();
            String fileName = System.currentTimeMillis() + "_" + photoFile.getOriginalFilename();
            File dest = new File(dir, fileName);
            photoFile.transferTo(dest);
            old.setPhoto(fileName);
        }
        if ("superadmin".equals(role)) {
            old.setLocationId(actualite.getLocationId());
            old.setDepartementId(actualite.getDepartementId());
        }
        actualiteRepository.save(old);
        return "redirect:/actualites";
    }

    @PostMapping("/delete/{id}")
    public String deleteActualite(@PathVariable String id) {
        actualiteRepository.deleteById(id);
        return "redirect:/actualites";
    }
}
