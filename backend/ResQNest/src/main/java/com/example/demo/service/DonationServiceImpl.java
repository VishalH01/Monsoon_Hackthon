package com.example.demo.service;

import com.example.demo.dto.DonationRequest;
import com.example.demo.dto.DonationResponse;
import com.example.demo.entity.Donation;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.DonationMapper;
import com.example.demo.repository.DonationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final DonationMapper donationMapper;

    @Override
    @Transactional
    public DonationResponse createDonation(DonationRequest request) {
        validateDonationDetails(request);
        
        Donation donation = donationMapper.toEntity(request);
        // Clear conflicting fields based on type
        if ("MONEY".equals(donation.getDonationType())) {
            donation.setItemName(null);
            donation.setQuantity(null);
            donation.setUnit(null);
        } else {
            donation.setAmount(null);
        }
        
        Donation savedDonation = donationRepository.save(donation);
        return donationMapper.toResponse(savedDonation);
    }

    @Override
    @Transactional(readOnly = true)
    public DonationResponse getDonationById(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
        return donationMapper.toResponse(donation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationResponse> getAllDonations(String donationType, String status, String donorEmail) {
        List<Donation> donations;
        if (donationType != null && !donationType.trim().isEmpty()) {
            donations = donationRepository.findByDonationType(donationType);
        } else if (status != null && !status.trim().isEmpty()) {
            donations = donationRepository.findByStatus(status);
        } else if (donorEmail != null && !donorEmail.trim().isEmpty()) {
            donations = donationRepository.findByDonorEmail(donorEmail);
        } else {
            donations = donationRepository.findAll();
        }
        return donations.stream()
                .map(donationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DonationResponse updateDonation(Long id, DonationRequest request) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
        
        validateDonationDetails(request);
        
        donationMapper.updateEntityFromRequest(request, donation);
        // Ensure constraints after mapping
        if ("MONEY".equals(donation.getDonationType())) {
            donation.setItemName(null);
            donation.setQuantity(null);
            donation.setUnit(null);
        } else {
            donation.setAmount(null);
        }
        
        Donation updatedDonation = donationRepository.save(donation);
        return donationMapper.toResponse(updatedDonation);
    }

    @Override
    @Transactional
    public DonationResponse updateStatus(Long id, String status) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
        
        if (!status.equals("PENDING") && !status.equals("RECEIVED") && !status.equals("DISTRIBUTED")) {
            throw new IllegalArgumentException("Invalid status. Must be PENDING, RECEIVED, or DISTRIBUTED");
        }
        
        donation.setStatus(status);
        Donation updatedDonation = donationRepository.save(donation);
        return donationMapper.toResponse(updatedDonation);
    }

    @Override
    @Transactional
    public void deleteDonation(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
        donationRepository.delete(donation);
    }

    private void validateDonationDetails(DonationRequest request) {
        if ("MONEY".equals(request.getDonationType())) {
            if (request.getAmount() == null) {
                throw new IllegalArgumentException("Amount is required for monetary donations");
            }
            if (request.getAmount() <= 0) {
                throw new IllegalArgumentException("Donation amount must be positive");
            }
        } else if ("ITEMS".equals(request.getDonationType())) {
            if (request.getItemName() == null || request.getItemName().trim().isEmpty()) {
                throw new IllegalArgumentException("Item name is required for item donations");
            }
            if (request.getQuantity() == null) {
                throw new IllegalArgumentException("Quantity is required for item donations");
            }
            if (request.getQuantity() <= 0) {
                throw new IllegalArgumentException("Item quantity must be positive");
            }
        }
    }
}
