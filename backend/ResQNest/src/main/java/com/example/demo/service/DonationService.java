package com.example.demo.service;

import com.example.demo.dto.DonationRequest;
import com.example.demo.dto.DonationResponse;
import java.util.List;

public interface DonationService {
    DonationResponse createDonation(DonationRequest request);
    DonationResponse getDonationById(Long id);
    List<DonationResponse> getAllDonations(String donationType, String status, String donorEmail);
    DonationResponse updateDonation(Long id, DonationRequest request);
    DonationResponse updateStatus(Long id, String status);
    void deleteDonation(Long id);
}
