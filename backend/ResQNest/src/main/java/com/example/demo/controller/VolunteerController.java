package com.example.demo.controller;

import com.example.demo.dto.VolunteerRequest;
import com.example.demo.dto.VolunteerResponse;
import com.example.demo.service.VolunteerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/volunteers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VolunteerController {

    private final VolunteerService volunteerService;

    @PostMapping
    public ResponseEntity<VolunteerResponse> createVolunteer(@Valid @RequestBody VolunteerRequest request) {
        VolunteerResponse response = volunteerService.createVolunteer(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VolunteerResponse> getVolunteerById(@PathVariable Long id) {
        VolunteerResponse response = volunteerService.getVolunteerById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<VolunteerResponse>> getAllVolunteers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String skill) {
        List<VolunteerResponse> response = volunteerService.getAllVolunteers(status, skill);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VolunteerResponse> updateVolunteer(
            @PathVariable Long id,
            @Valid @RequestBody VolunteerRequest request) {
        VolunteerResponse response = volunteerService.updateVolunteer(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<VolunteerResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        VolunteerResponse response = volunteerService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVolunteer(@PathVariable Long id) {
        volunteerService.deleteVolunteer(id);
        return ResponseEntity.noContent().build();
    }
}
