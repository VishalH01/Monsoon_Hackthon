package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributionRequest {

    @NotNull(message = "Inventory ID is required")
    private Long inventoryId;

    private Long volunteerId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "Recipient ('distributedTo') is required")
    private String distributedTo;

    @Pattern(regexp = "^(PENDING|COMPLETED|CANCELLED)$", message = "Status must be PENDING, COMPLETED, or CANCELLED")
    private String status;

    private String notes;
}
