package com.example.demo.mapper;

import com.example.demo.dto.DonationRequest;
import com.example.demo.dto.DonationResponse;
import com.example.demo.entity.Donation;
import org.springframework.stereotype.Component;

@Component
public class DonationMapper {

    public Donation toEntity(DonationRequest request) {
        if (request == null) {
            return null;
        }
        return Donation.builder()
                .donorName(request.getDonorName())
                .donorType(request.getDonorType())
                .donorEmail(request.getDonorEmail())
                .donationType(request.getDonationType())
                .amount(request.getAmount())
                .itemName(request.getItemName())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .status(request.getStatus() != null ? request.getStatus() : "PENDING")
                .notes(request.getNotes())
                .build();
    }

    public DonationResponse toResponse(Donation donation) {
        if (donation == null) {
            return null;
        }
        return DonationResponse.builder()
                .id(donation.getId())
                .donorName(donation.getDonorName())
                .donorType(donation.getDonorType())
                .donorEmail(donation.getDonorEmail())
                .donationType(donation.getDonationType())
                .amount(donation.getAmount())
                .itemName(donation.getItemName())
                .quantity(donation.getQuantity())
                .unit(donation.getUnit())
                .status(donation.getStatus())
                .notes(donation.getNotes())
                .createdAt(donation.getCreatedAt())
                .updatedAt(donation.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(DonationRequest request, Donation donation) {
        if (request == null || donation == null) {
            return;
        }
        if (request.getDonorName() != null) {
            donation.setDonorName(request.getDonorName());
        }
        if (request.getDonorType() != null) {
            donation.setDonorType(request.getDonorType());
        }
        if (request.getDonorEmail() != null) {
            donation.setDonorEmail(request.getDonorEmail());
        }
        if (request.getDonationType() != null) {
            donation.setDonationType(request.getDonationType());
        }
        
        // Handle fields depending on updated type
        donation.setAmount(request.getAmount());
        donation.setItemName(request.getItemName());
        donation.setQuantity(request.getQuantity());
        donation.setUnit(request.getUnit());
        
        if (request.getStatus() != null) {
            donation.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            donation.setNotes(request.getNotes());
        }
    }
}
