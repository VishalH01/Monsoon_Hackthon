package com.example.demo.mapper;

import com.example.demo.dto.VolunteerRequest;
import com.example.demo.dto.VolunteerResponse;
import com.example.demo.entity.Volunteer;
import org.springframework.stereotype.Component;

@Component
public class VolunteerMapper {

    public Volunteer toEntity(VolunteerRequest request) {
        if (request == null) {
            return null;
        }
        return Volunteer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .skills(request.getSkills())
                .status(request.getStatus() != null ? request.getStatus() : "AVAILABLE")
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .availabilityDetails(request.getAvailabilityDetails())
                .build();
    }

    public VolunteerResponse toResponse(Volunteer volunteer) {
        if (volunteer == null) {
            return null;
        }
        return VolunteerResponse.builder()
                .id(volunteer.getId())
                .name(volunteer.getName())
                .email(volunteer.getEmail())
                .phone(volunteer.getPhone())
                .skills(volunteer.getSkills())
                .status(volunteer.getStatus())
                .latitude(volunteer.getLatitude())
                .longitude(volunteer.getLongitude())
                .availabilityDetails(volunteer.getAvailabilityDetails())
                .createdAt(volunteer.getCreatedAt())
                .updatedAt(volunteer.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(VolunteerRequest request, Volunteer volunteer) {
        if (request == null || volunteer == null) {
            return;
        }
        if (request.getName() != null) {
            volunteer.setName(request.getName());
        }
        if (request.getEmail() != null) {
            volunteer.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            volunteer.setPhone(request.getPhone());
        }
        if (request.getSkills() != null) {
            volunteer.setSkills(request.getSkills());
        }
        if (request.getStatus() != null) {
            volunteer.setStatus(request.getStatus());
        }
        if (request.getLatitude() != null) {
            volunteer.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            volunteer.setLongitude(request.getLongitude());
        }
        if (request.getAvailabilityDetails() != null) {
            volunteer.setAvailabilityDetails(request.getAvailabilityDetails());
        }
    }
}
