package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+?[0-9\\-\\s]{7,15}$", message = "Invalid phone number")
    private String phone;

    private String skills;

    @Pattern(regexp = "^(AVAILABLE|BUSY|UNAVAILABLE)$", message = "Status must be AVAILABLE, BUSY, or UNAVAILABLE")
    private String status;

    private Double latitude;
    private Double longitude;

    private String availabilityDetails;
}
