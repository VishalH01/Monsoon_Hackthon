package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationRequest {

    @NotBlank(message = "Donor name is required")
    private String donorName;

    private String donorType;

    @NotBlank(message = "Donor email is required")
    @Email(message = "Invalid email format")
    private String donorEmail;

    @NotBlank(message = "Donation type is required")
    @Pattern(regexp = "^(MONEY|ITEMS)$", message = "Donation type must be MONEY or ITEMS")
    private String donationType;

    private Double amount;

    private String itemName;

    private Integer quantity;

    private String unit;

    @Pattern(regexp = "^(PENDING|RECEIVED|DISTRIBUTED)$", message = "Status must be PENDING, RECEIVED, or DISTRIBUTED")
    private String status;

    private String notes;
}
