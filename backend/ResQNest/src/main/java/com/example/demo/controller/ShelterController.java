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
    private final com.example.demo.repository.ShelterRepository shelterRepository;
    private final com.example.demo.repository.UserRepository userRepository;
    private final com.example.demo.mapper.ShelterMapper shelterMapper;

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

    @GetMapping("/nearby")
    public ResponseEntity<List<ShelterResponse>> getNearbyShelters(
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude) {
        List<com.example.demo.entity.Shelter> shelters = shelterRepository.findAll();
        List<ShelterResponse> responses = shelters.stream()
                .map(s -> {
                    ShelterResponse res = shelterMapper.toResponse(s);
                    double dist = calculateDistance(latitude, longitude, s.getLatitude(), s.getLongitude());
                    res.setDistance(Math.round(dist * 10.0) / 10.0);
                    return res;
                })
                .sorted((a, b) -> a.getDistance().compareTo(b.getDistance()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371.0; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    @GetMapping("/{id}/residents")
    public ResponseEntity<List<com.example.demo.dto.UserProfileResponse>> getResidents(@PathVariable("id") Long id) {
        List<com.example.demo.entity.User> residents = userRepository.findByAssignedShelterId(id);
        List<com.example.demo.dto.UserProfileResponse> responses = residents.stream()
                .map(u -> {
                    return com.example.demo.dto.UserProfileResponse.builder()
                            .id(u.getId())
                            .username(u.getUsername())
                            .email(u.getEmail())
                            .role(u.getRole().name())
                            .fullName(u.getFullName())
                            .phone(u.getPhone())
                            .location(u.getLocation())
                            .safetyStatus(u.getSafetyStatus())
                            .assignedShelterId(u.getAssignedShelterId())
                            .room(u.getRoom())
                            .entryDate(u.getEntryDate())
                            .specialNeeds(u.getSpecialNeeds())
                            .build();
                })
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/residents/{userId}")
    public ResponseEntity<com.example.demo.dto.UserProfileResponse> assignResident(
            @PathVariable("id") Long id,
            @PathVariable("userId") Long userId,
            @RequestParam(value = "room", required = false) String room,
            @RequestParam(value = "specialNeeds", required = false) String specialNeeds) {
        com.example.demo.entity.Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new com.example.demo.exception.ResourceNotFoundException("Shelter not found with id: " + id));
        com.example.demo.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.example.demo.exception.ResourceNotFoundException("User not found with id: " + userId));
        
        user.setAssignedShelterId(id);
        if (room != null) user.setRoom(room);
        if (specialNeeds != null) user.setSpecialNeeds(specialNeeds);
        user.setEntryDate(java.time.LocalDateTime.now());
        
        if (shelter.getOccupied() < shelter.getCapacity()) {
            shelter.setOccupied(shelter.getOccupied() + 1);
            if (shelter.getOccupied().equals(shelter.getCapacity())) {
                shelter.setStatus("FULL");
            }
            shelterRepository.save(shelter);
        }
        
        com.example.demo.entity.User savedUser = userRepository.save(user);
        
        return ResponseEntity.ok(com.example.demo.dto.UserProfileResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .fullName(savedUser.getFullName())
                .phone(savedUser.getPhone())
                .location(savedUser.getLocation())
                .safetyStatus(savedUser.getSafetyStatus())
                .assignedShelterId(savedUser.getAssignedShelterId())
                .room(savedUser.getRoom())
                .entryDate(savedUser.getEntryDate())
                .specialNeeds(savedUser.getSpecialNeeds())
                .build());
    }
}
