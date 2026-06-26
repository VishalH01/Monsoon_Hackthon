package com.example.demo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShelterResponse {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer capacity;
    private Integer occupied;
    private Integer availableBeds;
    private Double distance;
    private Double capacityPct;
    private String status;
    private String contactPhone;
    private String amenities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
