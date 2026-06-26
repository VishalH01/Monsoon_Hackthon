package com.example.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TestController {

    @GetMapping("/all")
    public String allAccess() {
        return "Public Content (No authentication required).";
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VICTIM') or hasRole('VOLUNTEER') or hasRole('NGO') or hasRole('SHELTER_MANAGER')")
    public String userAccess() {
        return "Authenticated Content (Any role can access).";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminAccess() {
        return "Admin Board (ADMIN role only).";
    }

    @GetMapping("/victim")
    @PreAuthorize("hasRole('VICTIM')")
    public String victimAccess() {
        return "Victim Board (VICTIM role only).";
    }

    @GetMapping("/volunteer")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public String volunteerAccess() {
        return "Volunteer Board (VOLUNTEER role only).";
    }

    @GetMapping("/ngo")
    @PreAuthorize("hasRole('NGO')")
    public String ngoAccess() {
        return "NGO Board (NGO role only).";
    }

    @GetMapping("/shelter-manager")
    @PreAuthorize("hasRole('SHELTER_MANAGER')")
    public String shelterManagerAccess() {
        return "Shelter Manager Board (SHELTER_MANAGER role only).";
    }
}
