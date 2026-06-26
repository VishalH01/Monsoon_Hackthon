package com.example.demo.controller;

import com.example.demo.dto.DistributionRequest;
import com.example.demo.dto.DistributionResponse;
import com.example.demo.service.DistributionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/distributions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DistributionController {

    private final DistributionService distributionService;

    @PostMapping
    public ResponseEntity<DistributionResponse> createDistribution(@Valid @RequestBody DistributionRequest request) {
        DistributionResponse response = distributionService.createDistribution(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DistributionResponse> getDistributionById(@PathVariable Long id) {
        DistributionResponse response = distributionService.getDistributionById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DistributionResponse>> getAllDistributions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long inventoryId,
            @RequestParam(required = false) Long volunteerId) {
        List<DistributionResponse> response = distributionService.getAllDistributions(status, inventoryId, volunteerId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DistributionResponse> updateDistribution(
            @PathVariable Long id,
            @Valid @RequestBody DistributionRequest request) {
        DistributionResponse response = distributionService.updateDistribution(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DistributionResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        DistributionResponse response = distributionService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDistribution(@PathVariable Long id) {
        distributionService.deleteDistribution(id);
        return ResponseEntity.noContent().build();
    }
}
