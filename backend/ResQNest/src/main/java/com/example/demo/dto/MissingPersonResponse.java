package com.example.demo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissingPersonResponse {
    private Long id;
    private String fullName;
    private Integer age;
    private String gender;
    private String lastSeenLocation;
    private Double latitude;
    private Double longitude;
    private String description;
    private String contactName;
    private String contactPhone;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
