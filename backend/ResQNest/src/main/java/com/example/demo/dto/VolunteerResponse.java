package com.example.demo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String skills;
    private String status;
    private Double latitude;
    private Double longitude;
    private String availabilityDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
