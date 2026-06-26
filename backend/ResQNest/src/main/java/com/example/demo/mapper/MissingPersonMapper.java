package com.example.demo.mapper;

import com.example.demo.dto.MissingPersonRequest;
import com.example.demo.dto.MissingPersonResponse;
import com.example.demo.entity.MissingPerson;
import org.springframework.stereotype.Component;

@Component
public class MissingPersonMapper {

    public MissingPerson toEntity(MissingPersonRequest request) {
        if (request == null) {
            return null;
        }
        return MissingPerson.builder()
                .fullName(request.getFullName())
                .age(request.getAge())
                .gender(request.getGender())
                .lastSeenLocation(request.getLastSeenLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getDescription())
                .photoUrl(request.getPhotoUrl())
                .contactName(request.getContactName())
                .contactPhone(request.getContactPhone())
                .status(request.getStatus() != null ? request.getStatus() : "MISSING")
                .build();
    }

    public MissingPersonResponse toResponse(MissingPerson missingPerson) {
        if (missingPerson == null) {
            return null;
        }
        return MissingPersonResponse.builder()
                .id(missingPerson.getId())
                .fullName(missingPerson.getFullName())
                .age(missingPerson.getAge())
                .gender(missingPerson.getGender())
                .lastSeenLocation(missingPerson.getLastSeenLocation())
                .latitude(missingPerson.getLatitude())
                .longitude(missingPerson.getLongitude())
                .description(missingPerson.getDescription())
                .photoUrl(missingPerson.getPhotoUrl())
                .contactName(missingPerson.getContactName())
                .contactPhone(missingPerson.getContactPhone())
                .status(missingPerson.getStatus())
                .createdAt(missingPerson.getCreatedAt())
                .updatedAt(missingPerson.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(MissingPersonRequest request, MissingPerson missingPerson) {
        if (request == null || missingPerson == null) {
            return;
        }
        if (request.getFullName() != null) {
            missingPerson.setFullName(request.getFullName());
        }
        if (request.getAge() != null) {
            missingPerson.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            missingPerson.setGender(request.getGender());
        }
        if (request.getLastSeenLocation() != null) {
            missingPerson.setLastSeenLocation(request.getLastSeenLocation());
        }
        if (request.getLatitude() != null) {
            missingPerson.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            missingPerson.setLongitude(request.getLongitude());
        }
        if (request.getDescription() != null) {
            missingPerson.setDescription(request.getDescription());
        }
        if (request.getPhotoUrl() != null) {
            missingPerson.setPhotoUrl(request.getPhotoUrl());
        }
        if (request.getContactName() != null) {
            missingPerson.setContactName(request.getContactName());
        }
        if (request.getContactPhone() != null) {
            missingPerson.setContactPhone(request.getContactPhone());
        }
        if (request.getStatus() != null) {
            missingPerson.setStatus(request.getStatus());
        }
    }
}
