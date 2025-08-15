package com.Admin.Admin.controller;

import com.Admin.Admin.model.Event;
import com.Admin.Admin.model.Admin;
import com.Admin.Admin.model.SuperAdmin;
import com.Admin.Admin.model.Location;
import com.Admin.Admin.model.Departement;
import com.Admin.Admin.repository.EventRepository;
import com.Admin.Admin.repository.LocationRepository;
import com.Admin.Admin.repository.DepartementRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.io.IOException;
import java.util.*;

@Controller
@RequestMapping("/events")
public class EventController {
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private LocationRepository locationRepository;
    @Autowired
    private DepartementRepository departementRepository;

    @GetMapping("")
    public String listEvents(HttpSession session, Model model,
                             @RequestParam(required = false) String locationId,
                             @RequestParam(required = false) String departementId) {
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        List<Event> events;
        List<Location> locations = locationRepository.findAll();
        List<Departement> departements = departementRepository.findAll();
        if (user == null) return "redirect:/login";
        if ("superadmin".equals(role)) {
            if (locationId != null && !locationId.isEmpty() && departementId != null && !departementId.isEmpty()) {
                events = eventRepository.findByLocationIdAndDepartementId(locationId, departementId);
            } else if (locationId != null && !locationId.isEmpty()) {
                events = eventRepository.findByLocationId(locationId);
            } else if (departementId != null && !departementId.isEmpty()) {
                events = eventRepository.findByDepartementId(departementId);
            } else {
                events = eventRepository.findAll();
            }
        } else if (user instanceof Admin admin) {
            events = eventRepository.findByLocationIdAndDepartementId(admin.getLocation(), admin.getDepartement());
        } else {
            events = List.of();
        }
        model.addAttribute("events", events);
        model.addAttribute("locations", locations);
        model.addAttribute("departements", departements);
        model.addAttribute("role", role);
        return "events/list";
    }

    @GetMapping("/create")
    public String showCreateForm(HttpSession session, Model model) {
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        List<Location> locations = locationRepository.findAll();
        List<Departement> departements = departementRepository.findAll();
        model.addAttribute("event", new Event());
        model.addAttribute("locations", locations);
        model.addAttribute("departements", departements);
        model.addAttribute("role", role);
        return "events/create";
    }

    @PostMapping("/create")
    public String createEvent(@ModelAttribute Event event,
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
            event.setPhoto(fileName);
        }
        if ("superadmin".equals(role)) {
            if (event.getLocationId() == null || event.getLocationId().isEmpty() || "tout".equalsIgnoreCase(event.getLocationId())) {
                event.setLocationId("all");
            }
            if (event.getDepartementId() == null || event.getDepartementId().isEmpty() || "tout".equalsIgnoreCase(event.getDepartementId())) {
                event.setDepartementId("all");
            }
            event.setCreatedBy(((SuperAdmin) user).getId());
        } else if (user instanceof Admin admin) {
            event.setLocationId(admin.getLocation());
            event.setDepartementId(admin.getDepartement());
            event.setCreatedBy(admin.getId());
        }
        event.setCreatedAt(new Date());
        event.setUpdatedAt(new Date());
        eventRepository.save(event);
        return "redirect:/events";
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable String id, Model model, HttpSession session) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty()) return "redirect:/events";
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        List<Location> locations = locationRepository.findAll();
        List<Departement> departements = departementRepository.findAll();
        model.addAttribute("event", eventOpt.get());
        model.addAttribute("locations", locations);
        model.addAttribute("departements", departements);
        model.addAttribute("role", role);
        return "events/edit";
    }

    @PostMapping("/edit/{id}")
    public String editEvent(@PathVariable String id, @ModelAttribute Event event,
                            @RequestParam("photoFile") MultipartFile photoFile,
                            HttpSession session) throws IOException {
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        if (user == null) return "redirect:/login";
        Optional<Event> oldOpt = eventRepository.findById(id);
        if (oldOpt.isEmpty()) return "redirect:/events";
        Event old = oldOpt.get();
        old.setTitle(event.getTitle());
        old.setDescription(event.getDescription());
        old.setStartDate(event.getStartDate());
        old.setEndDate(event.getEndDate());
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
            old.setLocationId(event.getLocationId());
            old.setDepartementId(event.getDepartementId());
        }
        old.setUpdatedAt(new Date());
        eventRepository.save(old);
        return "redirect:/events";
    }

    @PostMapping("/delete/{id}")
    public String deleteEvent(@PathVariable String id) {
        eventRepository.deleteById(id);
        return "redirect:/events";
    }
}
