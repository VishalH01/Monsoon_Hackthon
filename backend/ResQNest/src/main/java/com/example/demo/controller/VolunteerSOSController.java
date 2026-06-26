package com.example.demo.controller;

import com.example.demo.dto.SOSResponse;
import com.example.demo.entity.SOS;
import com.example.demo.service.SOSService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/volunteer/sos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VOLUNTEER')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VolunteerSOSController {

    private final SOSService sosService;

    @GetMapping("/my-missions")
    public ResponseEntity<List<SOSResponse>> getMyMissions(Principal principal) {
        List<SOS> list = sosService.getMissionsForVolunteer(principal.getName());
        List<SOSResponse> response = list.stream()
                .map(SOSResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptMission(
            @PathVariable Long id,
            Principal principal) {
        try {
            SOS sos = sosService.acceptMission(id, principal.getName());
            return ResponseEntity.ok(SOSResponse.fromEntity(sos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeMission(
            @PathVariable Long id,
            Principal principal) {
        try {
            SOS sos = sosService.completeMission(id, principal.getName());
            return ResponseEntity.ok(SOSResponse.fromEntity(sos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
