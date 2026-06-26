package com.example.demo.controller;

import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.dto.UserProfileResponse;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping({"/api/users", "/users"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Principal principal) {
        UserProfileResponse profile = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse updatedProfile = userService.updateProfile(principal.getName(), request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(principal.getName(), request);
            return ResponseEntity.ok("Password changed successfully!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CheckInRequest {
        private String safetyStatus;
    }

    @PostMapping("/check-in")
    public ResponseEntity<UserProfileResponse> checkIn(
            Principal principal,
            @RequestBody(required = false) CheckInRequest request) {
        String status = (request != null) ? request.getSafetyStatus() : "SAFE";
        UserProfileResponse response = userService.checkIn(principal.getName(), status);
        return ResponseEntity.ok(response);
    }
}
