package com.Admin.Admin.controller;

import com.Admin.Admin.model.Employee;
import com.Admin.Admin.repository.EmployeeRepository;
import com.Admin.Admin.repository.LocationRepository;
import com.Admin.Admin.repository.DepartementRepository;
import com.Admin.Admin.model.Location;
import com.Admin.Admin.model.Departement;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/employees")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private DepartementRepository departementRepository;

    @GetMapping
    public String listEmployees(HttpSession session, Model model) {
        Object user = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        List<Employee> employees;
        if (user != null && "admin".equals(role)) {
            String location = ((com.Admin.Admin.model.Admin) user).getLocation();
            String departement = ((com.Admin.Admin.model.Admin) user).getDepartement();
            employees = employeeRepository.findAll().stream()
                .filter(emp -> (
                    (location != null && emp.getLocation() != null &&
                        (location.equals(emp.getLocation()) ||
                         location.equalsIgnoreCase(emp.getLocation()) ||
                         emp.getLocation().equals(location)))
                    &&
                    (departement != null && emp.getDepartement() != null &&
                        (departement.equals(emp.getDepartement()) ||
                         departement.equalsIgnoreCase(emp.getDepartement()) ||
                         emp.getDepartement().equals(departement)))
                ))
                .toList();
        } else {
            employees = employeeRepository.findAll();
        }
        // Préparer les maps id->nom pour location et departement
        var locations = locationRepository.findAll();
        var departements = departementRepository.findAll();
        java.util.Map<String, String> locationMap = new java.util.HashMap<>();
        for (Location loc : locations) {
            locationMap.put(loc.getId(), loc.getNom());
        }
        java.util.Map<String, String> departementMap = new java.util.HashMap<>();
        for (Departement dep : departements) {
            departementMap.put(dep.getId(), dep.getNom());
        }
        model.addAttribute("employees", employees);
        model.addAttribute("locationMap", locationMap);
        model.addAttribute("departementMap", departementMap);
        return "employees/list";
    }

    @GetMapping("/create")
    public String showCreateForm(Model model) {
        model.addAttribute("employee", new Employee());
        return "employees/create";
    }

    @PostMapping
    public String createEmployee(@ModelAttribute Employee employee) {
        employeeRepository.save(employee);
        return "redirect:/employees";
    }

    @GetMapping("/{id}")
    public String viewEmployee(@PathVariable String id, Model model) {
        Optional<Employee> employee = employeeRepository.findById(id);
        employee.ifPresent(e -> model.addAttribute("employee", e));
        return employee.isPresent() ? "employees/detail" : "redirect:/employees";
    }

    @GetMapping("/{id}/edit")
    public String showEditForm(@PathVariable String id, Model model) {
        Optional<Employee> employee = employeeRepository.findById(id);
        employee.ifPresent(e -> model.addAttribute("employee", e));
        return employee.isPresent() ? "employees/edit" : "redirect:/employees";
    }

    @PostMapping("/{id}/edit")
    public String updateEmployee(@PathVariable String id, @ModelAttribute Employee employee) {
    employee.setId(id);
        employeeRepository.save(employee);
        return "redirect:/employees/" + id;
    }

    @PostMapping("/{id}/delete")
    public String deleteEmployee(@PathVariable String id) {
        employeeRepository.deleteById(id);
        return "redirect:/employees";
    }
}
