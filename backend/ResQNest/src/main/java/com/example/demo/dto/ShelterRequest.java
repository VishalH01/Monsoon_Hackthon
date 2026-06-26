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
public class ShelterRequest {

    @NotBlank(message = "Shelter name is required")
    private String name;

    private String address;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotNull(message = "Capacity is required")
    @Min(value = 0, message = "Capacity cannot be negative")
    private Integer capacity;

    @Min(value = 0, message = "Occupied count cannot be negative")
    private Integer occupied;

    @Pattern(regexp = "^(ACTIVE|FULL|INACTIVE)$", message = "Status must be ACTIVE, FULL, or INACTIVE")
    private String status;

    private String contactPhone;

    private String amenities;
}
