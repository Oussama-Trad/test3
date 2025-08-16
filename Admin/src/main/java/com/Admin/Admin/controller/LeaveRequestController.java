package com.Admin.Admin.controller;

import com.Admin.Admin.model.LeaveRequest;
import com.Admin.Admin.repository.LeaveRequestRepository;
import com.Admin.Admin.model.Admin;
import com.Admin.Admin.model.SuperAdmin;
import com.Admin.Admin.model.Employee;
import com.Admin.Admin.model.Location;
import com.Admin.Admin.model.Departement;
import com.Admin.Admin.repository.EmployeeRepository;
import com.Admin.Admin.repository.LocationRepository;
import com.Admin.Admin.repository.DepartementRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/leave-requests")
public class LeaveRequestController {
	@Autowired
	private LeaveRequestRepository leaveRequestRepository;
	@Autowired
	private EmployeeRepository employeeRepository;
	@Autowired
	private LocationRepository locationRepository;
	@Autowired
	private DepartementRepository departementRepository;

	@GetMapping("")
	public String listLeaveRequests(HttpSession session, Model model) {
		Object user = session.getAttribute("user");
		String role = (String) session.getAttribute("role");
		List<LeaveRequest> requests;
		if (user == null) {
			return "redirect:/login";
		}
		if ("superadmin".equals(role)) {
			requests = leaveRequestRepository.findAll();
		} else if (user instanceof Admin) {
			Admin admin = (Admin) user;
			requests = leaveRequestRepository.findByLocationIdAndDepartementId(admin.getLocation(), admin.getDepartement());
		} else {
			requests = List.of();
		}
		// Préparer les maps ID -> nom
		var employeeMap = new java.util.HashMap<String, String>();
		for (Employee emp : employeeRepository.findAll()) {
			String nomComplet = emp.getNom() + " " + emp.getPrenom();
			if (emp.getId() != null) employeeMap.put(emp.getId(), nomComplet);
			if (emp.getNumTel() != null) employeeMap.put(emp.getNumTel(), nomComplet);
			if (emp.getAdresse1() != null) employeeMap.put(emp.getAdresse1(), nomComplet);
		}
		var locationMap = new java.util.HashMap<String, String>();
		for (Location loc : locationRepository.findAll()) {
			if (loc.getId() != null) locationMap.put(loc.getId(), loc.getNom());
			if (loc.getNom() != null) locationMap.put(loc.getNom(), loc.getNom());
		}
		var departementMap = new java.util.HashMap<String, String>();
		for (Departement dep : departementRepository.findAll()) {
			if (dep.getId() != null) departementMap.put(dep.getId(), dep.getNom());
			if (dep.getNom() != null) departementMap.put(dep.getNom(), dep.getNom());
		}
		model.addAttribute("requests", requests);
		model.addAttribute("role", role);
		model.addAttribute("employeeMap", employeeMap);
		model.addAttribute("locationMap", locationMap);
		model.addAttribute("departementMap", departementMap);
		return "leaveRequests/list";
	}

	@PostMapping("/update-status/{id}")
	public String updateStatus(@PathVariable String id, @RequestParam String status) {
		Optional<LeaveRequest> reqOpt = leaveRequestRepository.findById(id);
		if (reqOpt.isPresent()) {
			LeaveRequest req = reqOpt.get();
			req.setStatus(status);
			leaveRequestRepository.save(req);
		}
		return "redirect:/leave-requests";
	}
}
