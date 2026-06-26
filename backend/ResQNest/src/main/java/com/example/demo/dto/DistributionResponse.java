package com.example.demo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributionResponse {
    private Long id;
    private Long inventoryId;
    private String inventoryName;
    private Long volunteerId;
    private String volunteerName;
    private Integer quantity;
    private String distributedTo;
    private String status;
    private LocalDateTime distributionDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
