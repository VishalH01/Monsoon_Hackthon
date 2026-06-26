package com.example.demo.controller;

import com.example.demo.dto.SOSResponse;
import com.example.demo.entity.SOS;
import com.example.demo.entity.SOSStatus;
import com.example.demo.service.SOSService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/sos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminSOSController {

    private final SOSService sosService;

    @GetMapping
    public ResponseEntity<List<SOSResponse>> getAllSOS(
            @RequestParam(value = "status", required = false) SOSStatus status) {
        
        List<SOS> list = (status != null) ? sosService.getSOSByStatus(status) : sosService.getAllSOS();
        List<SOSResponse> response = list.stream()
                .map(SOSResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignVolunteer(
            @PathVariable Long id,
            @RequestParam("volunteerId") Long volunteerId) {
        try {
            SOS sos = sosService.assignVolunteer(id, volunteerId);
            return ResponseEntity.ok(SOSResponse.fromEntity(sos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") SOSStatus status) {
        try {
            SOS sos = sosService.updateStatus(id, status);
            return ResponseEntity.ok(SOSResponse.fromEntity(sos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
