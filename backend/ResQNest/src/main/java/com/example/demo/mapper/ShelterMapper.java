package com.example.demo.mapper;

import com.example.demo.dto.ShelterRequest;
import com.example.demo.dto.ShelterResponse;
import com.example.demo.entity.Shelter;
import org.springframework.stereotype.Component;

@Component
public class ShelterMapper {

    public Shelter toEntity(ShelterRequest request) {
        if (request == null) {
            return null;
        }
        return Shelter.builder()
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .capacity(request.getCapacity())
                .occupied(request.getOccupied() != null ? request.getOccupied() : 0)
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .contactPhone(request.getContactPhone())
                .amenities(request.getAmenities())
                .build();
    }

    public ShelterResponse toResponse(Shelter shelter) {
        if (shelter == null) {
            return null;
        }
        int availableBeds = Math.max(0, shelter.getCapacity() - shelter.getOccupied());
        
        double capPct = 0.0;
        if (shelter.getCapacity() != null && shelter.getCapacity() > 0) {
            capPct = ((double) shelter.getOccupied() * 100.0) / shelter.getCapacity();
            capPct = Math.round(capPct * 10.0) / 10.0;
        }

        return ShelterResponse.builder()
                .id(shelter.getId())
                .name(shelter.getName())
                .address(shelter.getAddress())
                .latitude(shelter.getLatitude())
                .longitude(shelter.getLongitude())
                .capacity(shelter.getCapacity())
                .occupied(shelter.getOccupied())
                .availableBeds(availableBeds)
                .capacityPct(capPct)
                .status(shelter.getStatus())
                .contactPhone(shelter.getContactPhone())
                .amenities(shelter.getAmenities())
                .createdAt(shelter.getCreatedAt())
                .updatedAt(shelter.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(ShelterRequest request, Shelter shelter) {
        if (request == null || shelter == null) {
            return;
        }
        if (request.getName() != null) {
            shelter.setName(request.getName());
        }
        if (request.getAddress() != null) {
            shelter.setAddress(request.getAddress());
        }
        if (request.getLatitude() != null) {
            shelter.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            shelter.setLongitude(request.getLongitude());
        }
        if (request.getCapacity() != null) {
            shelter.setCapacity(request.getCapacity());
        }
        if (request.getOccupied() != null) {
            shelter.setOccupied(request.getOccupied());
        }
        if (request.getStatus() != null) {
            shelter.setStatus(request.getStatus());
        }
        if (request.getContactPhone() != null) {
            shelter.setContactPhone(request.getContactPhone());
        }
        if (request.getAmenities() != null) {
            shelter.setAmenities(request.getAmenities());
        }
    }
}
