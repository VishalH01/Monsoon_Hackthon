package com.example.demo.controller;

import com.example.demo.dto.MissingPersonRequest;
import com.example.demo.dto.MissingPersonResponse;
import com.example.demo.service.MissingPersonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/missing-persons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MissingPersonController {

    private final MissingPersonService missingPersonService;
    private final com.example.demo.repository.MissingPersonRepository missingPersonRepository;

    @PostMapping
    public ResponseEntity<MissingPersonResponse> createMissingPerson(@Valid @RequestBody MissingPersonRequest request) {
        MissingPersonResponse response = missingPersonService.createMissingPerson(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissingPersonResponse> getMissingPersonById(@PathVariable Long id) {
        MissingPersonResponse response = missingPersonService.getMissingPersonById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MissingPersonResponse>> getAllMissingPersons(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String location) {
        List<MissingPersonResponse> response = missingPersonService.getAllMissingPersons(status, name, location);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MissingPersonResponse> updateMissingPerson(
            @PathVariable Long id,
            @Valid @RequestBody MissingPersonRequest request) {
        MissingPersonResponse response = missingPersonService.updateMissingPerson(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MissingPersonResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        MissingPersonResponse response = missingPersonService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMissingPerson(@PathVariable Long id) {
        missingPersonService.deleteMissingPerson(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<com.example.demo.dto.MissingPersonStatsResponse> getStats() {
        long total = missingPersonRepository.count();
        java.util.List<com.example.demo.entity.MissingPerson> list = missingPersonRepository.findAll();
        long missing = list.stream().filter(m -> "MISSING".equalsIgnoreCase(m.getStatus())).count();
        long foundSafe = list.stream().filter(m -> "FOUND".equalsIgnoreCase(m.getStatus()) || "REUNITED".equalsIgnoreCase(m.getStatus())).count();
        
        return ResponseEntity.ok(com.example.demo.dto.MissingPersonStatsResponse.builder()
                .totalReported(total)
                .currentlyMissing(missing)
                .foundSafe(foundSafe)
                .identityPending(0)
                .build());
    }
}
