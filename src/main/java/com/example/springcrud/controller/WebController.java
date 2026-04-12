package com.example.springcrud.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class WebController {

    // ================= LANDING PAGE =================
    @GetMapping("/")
    public String Login() {
        return "Login";
    }

    // ================= ADMIN PANEL ROUTES =================
    @GetMapping("/admin")
    public String adminDashboard(Model model) {
        model.addAttribute("pageTitle", "Dashboard");
        model.addAttribute("activeTab", "dashboard");
        return "admin/dashboard";
    }

    @GetMapping("/admin/patients")
    public String adminPatients(Model model) {
        model.addAttribute("pageTitle", "Patient Management");
        model.addAttribute("activeTab", "patients");
        return "admin/patients";
    }

    @GetMapping("/admin/doctors")
    public String adminDoctors(Model model) {
        model.addAttribute("pageTitle", "Doctor Management");
        model.addAttribute("activeTab", "doctors");
        return "admin/doctors";
    }

    @GetMapping("/admin/clinics")
    public String adminClinics(Model model) {
        model.addAttribute("pageTitle", "Clinic Management");
        model.addAttribute("activeTab", "clinics");
        return "admin/clinics";
    }

    @GetMapping("/admin/medicines")
    public String adminMedicines(Model model) {
        model.addAttribute("pageTitle", "Medicines Management");
        model.addAttribute("activeTab", "medicines");
        return "admin/medicines";
    }

    @GetMapping("/admin/tests")
    public String adminTests(Model model) {
        model.addAttribute("pageTitle", "Tests Management");
        model.addAttribute("activeTab", "tests");
        return "admin/tests";
    }

    @GetMapping("/admin/profile")
    public String adminProfile(Model model) {
        model.addAttribute("pageTitle", "Admin Profile");
        model.addAttribute("activeTab", "profile");
        return "admin/profile";
    }

    @GetMapping("/admin/patients/add")
    public String adminAddPatient(Model model) {
        model.addAttribute("pageTitle", "Add Patient");
        model.addAttribute("activeTab", "patients");
        return "admin/patients-add";
    }

    @GetMapping("/admin/clinics/add")
    public String addClinicPage(Model model) {
        model.addAttribute("pageTitle", "Add Clinic");
        model.addAttribute("activeTab", "clinics");
        return "admin/add-clinic";
    }

    @GetMapping("/admin/doctors/add")
    public String adminAddDoctor(Model model) {
        model.addAttribute("pageTitle", "Add Doctor");
        model.addAttribute("activeTab", "doctors");
        return "admin/doctors-add";
    }

    @GetMapping("/admin/medicines/add")
    public String addMedicinePage() {
        return "admin/medicines-add";
    }

    @GetMapping("/admin/doctorLogin")
    public String adminDoctorLogin(Model model) {
        model.addAttribute("pageTitle", "Doctor Login");
        model.addAttribute("activeTab", "doctorLogin");
        return "admin/doctor-login";
    }

    @GetMapping("/admin/patients/edit/{id}")
    public String editPatient(@PathVariable String id, Model model) {
        model.addAttribute("patientId", id);
        model.addAttribute("pageTitle", "Edit Patient");
        model.addAttribute("activeTab", "patients");
        return "admin/patients-add";
    }

    @GetMapping("/forgot-password")
    public String forgotPasswordPage() {
        return "forgot-password";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "createAccount";
    }

    @GetMapping("/admin/contactSupport")
    public String contactSupportPage(Model model) {
        model.addAttribute("pageTitle", "Contact Support");
        model.addAttribute("activeTab", "contactSupport");
        return "admin/contactSupport";
    }

    @GetMapping("/doctor/AI") // ← opens at http://localhost:8080/
    public String home() {
        return "PrathmAi"; // ← Spring looks for this file in /static/
    }

    @GetMapping("/AI") // ← opens at http://localhost:8080/
    public String Ai() {
        return "PrathmAi"; // ← Spring looks for this file in /static/
    }
}
