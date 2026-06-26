package com.example.demo.controller;

import com.example.demo.dto.SOSResponse;
import com.example.demo.entity.SOS;
import com.example.demo.service.SOSService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/sos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class VictimSOSController {

    private final SOSService sosService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createSOS(
            Principal principal,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        String username = (principal != null) ? principal.getName() : null;
        
        try {
            SOS sos = sosService.createSOS(username, latitude, longitude, description, image);
            return ResponseEntity.ok(SOSResponse.fromEntity(sos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error raising SOS: " + e.getMessage());
        }
    }
}
