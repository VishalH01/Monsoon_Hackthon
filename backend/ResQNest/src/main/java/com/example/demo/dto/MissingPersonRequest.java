package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissingPersonRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private Integer age;

    private String gender;

    private String lastSeenLocation;

    private Double latitude;

    private Double longitude;

    private String description;

    private String photoUrl;

    private String contactName;

    private String contactPhone;

    @Pattern(regexp = "^(MISSING|FOUND|REUNITED)$", message = "Status must be MISSING, FOUND, or REUNITED")
    private String status;
}
