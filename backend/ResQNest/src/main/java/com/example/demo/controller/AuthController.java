package com.example.demo.controller;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/auth", "/auth"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final com.example.demo.repository.VolunteerRepository volunteerRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        // Create new user's account
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .role(signUpRequest.getRole())
                .fullName(signUpRequest.getFullName())
                .phone(signUpRequest.getPhone())
                .location(signUpRequest.getLocation())
                .acceptTerms(signUpRequest.getAcceptTerms())
                .skills(signUpRequest.getSkills())
                .availability(signUpRequest.getAvailability())
                .build();

        User savedUser = userRepository.save(user);

        // Auto-seed Volunteer table if the registered role is VOLUNTEER
        if (signUpRequest.getRole() == com.example.demo.entity.Role.VOLUNTEER) {
            try {
                com.example.demo.entity.Volunteer volunteer = com.example.demo.entity.Volunteer.builder()
                        .name(signUpRequest.getFullName() != null && !signUpRequest.getFullName().trim().isEmpty() ? signUpRequest.getFullName() : signUpRequest.getUsername())
                        .email(signUpRequest.getEmail())
                        .phone(signUpRequest.getPhone() != null && !signUpRequest.getPhone().trim().isEmpty() ? signUpRequest.getPhone() : "N/A")
                        .skills(signUpRequest.getSkills())
                        .availabilityDetails(signUpRequest.getAvailability())
                        .status("AVAILABLE")
                        .build();
                volunteerRepository.save(volunteer);
            } catch (Exception e) {
                // Fail-safe: log warning but don't fail registration
            }
        }

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User userDetails = (User) authentication.getPrincipal();
        String jwt = jwtUtils.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getRole().name()
        ));
    }
}
