package com.example.demo.dto;

import com.example.demo.entity.SOS;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SOSResponse {
    private Long id;
    private Double latitude;
    private Double longitude;
    private String description;
    private String imageUrl;
    private String status;
    private String victimUsername;
    private String volunteerUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SOSResponse fromEntity(SOS sos) {
        if (sos == null) return null;
        return SOSResponse.builder()
                .id(sos.getId())
                .latitude(sos.getLatitude())
                .longitude(sos.getLongitude())
                .description(sos.getDescription())
                .imageUrl(sos.getImageUrl())
                .status(sos.getStatus().name())
                .victimUsername(sos.getVictim() != null ? sos.getVictim().getUsername() : "Guest")
                .volunteerUsername(sos.getVolunteer() != null ? sos.getVolunteer().getUsername() : null)
                .createdAt(sos.getCreatedAt())
                .updatedAt(sos.getUpdatedAt())
                .build();
    }
}
