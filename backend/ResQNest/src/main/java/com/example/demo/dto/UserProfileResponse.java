package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String role;

    // Extended fields
    private String fullName;
    private String phone;
    private String location;
    private String skills;
    private String availability;
    private Boolean acceptTerms;

    // Notification toggles
    private Boolean emailAlerts;
    private Boolean smsAlerts;
    private Boolean pushNotifications;

    // Check-in details
    private String safetyStatus;
    private Boolean safetyStatusVerified;
    private LocalDateTime lastCheckIn;

    // Shelter Resident details
    private Long assignedShelterId;
    private String room;
    private LocalDateTime entryDate;
    private String specialNeeds;
}
