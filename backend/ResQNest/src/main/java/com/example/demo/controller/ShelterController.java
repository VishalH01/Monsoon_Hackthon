package com.example.demo.controller;

import com.example.demo.dto.ShelterRequest;
import com.example.demo.dto.ShelterResponse;
import com.example.demo.service.ShelterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/shelters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ShelterController {

    private final ShelterService shelterService;

    @PostMapping
    public ResponseEntity<ShelterResponse> createShelter(@Valid @RequestBody ShelterRequest request) {
        ShelterResponse response = shelterService.createShelter(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShelterResponse> getShelterById(@PathVariable Long id) {
        ShelterResponse response = shelterService.getShelterById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ShelterResponse>> getAllShelters(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String name) {
        List<ShelterResponse> response = shelterService.getAllShelters(status, name);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShelterResponse> updateShelter(
            @PathVariable Long id,
            @Valid @RequestBody ShelterRequest request) {
        ShelterResponse response = shelterService.updateShelter(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/occupied")
    public ResponseEntity<ShelterResponse> updateOccupiedCount(
            @PathVariable Long id,
            @RequestParam Integer occupied) {
        ShelterResponse response = shelterService.updateOccupiedCount(id, occupied);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShelter(@PathVariable Long id) {
        shelterService.deleteShelter(id);
        return ResponseEntity.noContent().build();
    }
}
