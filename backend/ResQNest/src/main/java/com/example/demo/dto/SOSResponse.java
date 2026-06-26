package com.example.demo.dto;

import com.example.demo.entity.SOS;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
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
    
    // Prioritization Details
    private Integer age;
    private Integer severity;
    private Boolean hasChildren;
    private Boolean isMedicalEmergency;
    private Boolean isDisabled;
    private String priority;
    private Double dynamicPriorityScore;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SOSResponse fromEntity(SOS sos) {
        if (sos == null) return null;
        
        // Calculate dynamic score for presentation
        double baseScore = (sos.getBasePriorityScore() != null) ? sos.getBasePriorityScore() : 0.0;
        long minutesWaiting = (sos.getCreatedAt() != null) ? 
                Duration.between(sos.getCreatedAt(), LocalDateTime.now()).toMinutes() : 0;
        double dynamicScore = baseScore + (minutesWaiting * 0.5);

        return SOSResponse.builder()
                .id(sos.getId())
                .latitude(sos.getLatitude())
                .longitude(sos.getLongitude())
                .description(sos.getDescription())
                .imageUrl(sos.getImageUrl())
                .status(sos.getStatus().name())
                .victimUsername(sos.getVictim() != null ? sos.getVictim().getUsername() : "Guest")
                .volunteerUsername(sos.getVolunteer() != null ? sos.getVolunteer().getUsername() : null)
                .age(sos.getAge())
                .severity(sos.getSeverity())
                .hasChildren(sos.getHasChildren())
                .isMedicalEmergency(sos.getIsMedicalEmergency())
                .isDisabled(sos.getIsDisabled())
                .priority(sos.getPriority() != null ? sos.getPriority().name() : "LOW")
                .dynamicPriorityScore(dynamicScore)
                .createdAt(sos.getCreatedAt())
                .updatedAt(sos.getUpdatedAt())
                .build();
    }
}
