package com.example.demo.mapper;

import com.example.demo.dto.DistributionRequest;
import com.example.demo.dto.DistributionResponse;
import com.example.demo.entity.Distribution;
import com.example.demo.entity.Inventory;
import com.example.demo.entity.Volunteer;
import org.springframework.stereotype.Component;

@Component
public class DistributionMapper {

    public Distribution toEntity(DistributionRequest request, Inventory inventory, Volunteer volunteer) {
        if (request == null) {
            return null;
        }
        return Distribution.builder()
                .inventory(inventory)
                .volunteer(volunteer)
                .quantity(request.getQuantity())
                .distributedTo(request.getDistributedTo())
                .status(request.getStatus() != null ? request.getStatus() : "PENDING")
                .notes(request.getNotes())
                .build();
    }

    public DistributionResponse toResponse(Distribution distribution) {
        if (distribution == null) {
            return null;
        }
        Long inventoryId = null;
        String inventoryName = null;
        if (distribution.getInventory() != null) {
            inventoryId = distribution.getInventory().getId();
            inventoryName = distribution.getInventory().getItemName();
        }
        
        Long volunteerId = null;
        String volunteerName = null;
        if (distribution.getVolunteer() != null) {
            volunteerId = distribution.getVolunteer().getId();
            volunteerName = distribution.getVolunteer().getName();
        }
        
        return DistributionResponse.builder()
                .id(distribution.getId())
                .inventoryId(inventoryId)
                .inventoryName(inventoryName)
                .volunteerId(volunteerId)
                .volunteerName(volunteerName)
                .quantity(distribution.getQuantity())
                .distributedTo(distribution.getDistributedTo())
                .status(distribution.getStatus())
                .distributionDate(distribution.getDistributionDate())
                .notes(distribution.getNotes())
                .createdAt(distribution.getCreatedAt())
                .updatedAt(distribution.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(DistributionRequest request, Distribution distribution, Inventory inventory, Volunteer volunteer) {
        if (request == null || distribution == null) {
            return;
        }
        distribution.setInventory(inventory);
        distribution.setVolunteer(volunteer);
        
        if (request.getQuantity() != null) {
            distribution.setQuantity(request.getQuantity());
        }
        if (request.getDistributedTo() != null) {
            distribution.setDistributedTo(request.getDistributedTo());
        }
        if (request.getStatus() != null) {
            distribution.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            distribution.setNotes(request.getNotes());
        }
    }
}
