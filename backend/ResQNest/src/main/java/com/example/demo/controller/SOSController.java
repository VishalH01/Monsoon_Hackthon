package com.example.demo.controller;

import com.example.demo.dto.SOSResponse;
import com.example.demo.entity.SOS;
import com.example.demo.entity.SOSStatus;
import com.example.demo.service.SOSService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class SOSController {

    private final SOSService sosService;

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SOSCreateRequest {
        private Double latitude;
        private Double longitude;
        private String description;
        private Integer age = 30;
        private Integer severity = 1;
        private Boolean hasChildren = false;
        private Boolean isMedicalEmergency = false;
        private Boolean isDisabled = false;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SOSStatusUpdateRequest {
        private SOSStatus status;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SOSAssignRequest {
        private Long volunteerId;
    }

    @PostMapping(value = {"/api/v1/sos", "/sos", "/api/sos"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createSOS(
            Principal principal,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "age", required = false, defaultValue = "30") Integer age,
            @RequestParam(value = "severity", required = false, defaultValue = "1") Integer severity,
            @RequestParam(value = "hasChildren", required = false, defaultValue = "false") Boolean hasChildren,
            @RequestParam(value = "isMedicalEmergency", required = false, defaultValue = "false") Boolean isMedicalEmergency,
            @RequestParam(value = "isDisabled", required = false, defaultValue = "false") Boolean isDisabled) {
        
        String username = (principal != null) ? principal.getName() : null;
        try {
            SOS sos = sosService.createSOS(username, latitude, longitude, description, image,
                    age, severity, hasChildren, isMedicalEmergency, isDisabled);
            return ResponseEntity.ok(SOSResponse.fromEntity(sos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error raising SOS: " + e.getMessage());
        }
    }

    @PostMapping(value = {"/api/v1/sos", "/sos", "/api/sos"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createSOSJson(
            Principal principal,
            @RequestBody SOSCreateRequest request) {
        String username = (principal != null) ? principal.getName() : null;
        try {
            SOS sos = sosService.createSOS(username, request.getLatitude(), request.getLongitude(),
                    request.getDescription(), null, request.getAge(), request.getSeverity(),
                    request.getHasChildren(), request.getIsMedicalEmergency(), request.getIsDisabled());
            return ResponseEntity.ok(SOSResponse.fromEntity(sos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error raising SOS: " + e.getMessage());
        }
    }

    @GetMapping({"/api/v1/sos", "/sos", "/api/sos"})
    public ResponseEntity<List<SOSResponse>> getAllSOS(
            @RequestParam(value = "status", required = false) SOSStatus status) {
        List<SOS> list = (status != null) ? sosService.getSOSByStatus(status) : sosService.getAllSOS();
        List<SOSResponse> response = list.stream()
                .map(SOSResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping({"/api/v1/sos/{id}", "/sos/{id}", "/api/sos/{id}"})
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam(value = "status", required = false) SOSStatus statusParam,
            @RequestBody(required = false) SOSStatusUpdateRequest body) {
        SOSStatus status = statusParam;
        if (status == null && body != null) {
            status = body.getStatus();
        }
        if (status == null) {
            return ResponseEntity.badRequest().body("Error: status must be provided as parameter or in request body");
        }
        try {
            SOS sos = sosService.updateStatus(id, status);
            return ResponseEntity.ok(SOSResponse.fromEntity(sos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping({"/api/v1/sos/{id}/assign", "/sos/{id}/assign", "/api/sos/{id}/assign"})
    public ResponseEntity<?> assignVolunteer(
            @PathVariable Long id,
            @RequestParam(value = "volunteerId", required = false) Long volunteerIdParam,
            @RequestBody(required = false) SOSAssignRequest body) {
        Long volunteerId = volunteerIdParam;
        if (volunteerId == null && body != null) {
            volunteerId = body.getVolunteerId();
        }
        if (volunteerId == null) {
            return ResponseEntity.badRequest().body("Error: volunteerId must be provided as parameter or in request body");
        }
        try {
            SOS sos = sosService.assignVolunteer(id, volunteerId);
            return ResponseEntity.ok(SOSResponse.fromEntity(sos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping({"/api/v1/priority", "/priority", "/api/priority"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> forceUpdatePriorities() {
        sosService.autoUpdatePriorities();
        return ResponseEntity.ok("Dynamic priorities recalculated and logged successfully!");
    }
}
