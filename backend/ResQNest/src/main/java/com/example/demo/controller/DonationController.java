package com.example.demo.controller;

import com.example.demo.dto.DonationRequest;
import com.example.demo.dto.DonationResponse;
import com.example.demo.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/donations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    public ResponseEntity<DonationResponse> createDonation(@Valid @RequestBody DonationRequest request) {
        DonationResponse response = donationService.createDonation(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationResponse> getDonationById(@PathVariable Long id) {
        DonationResponse response = donationService.getDonationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DonationResponse>> getAllDonations(
            @RequestParam(required = false) String donationType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String donorEmail) {
        List<DonationResponse> response = donationService.getAllDonations(donationType, status, donorEmail);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonationResponse> updateDonation(
            @PathVariable Long id,
            @Valid @RequestBody DonationRequest request) {
        DonationResponse response = donationService.updateDonation(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DonationResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        DonationResponse response = donationService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
        donationService.deleteDonation(id);
        return ResponseEntity.noContent().build();
    }
}
