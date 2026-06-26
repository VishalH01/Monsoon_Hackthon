package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sos_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SOS {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String description;

    private String location; // text location name
    private String disasterType; // e.g. Flood, Earthquake, Wildfire, etc.
    private Integer peopleAffected;

    private String imageUrl;

    // Prioritization Criteria
    private Integer age;
    private Integer severity;
    private Boolean hasChildren;
    private Boolean isMedicalEmergency;
    private Boolean isDisabled;

    @Enumerated(EnumType.STRING)
    private SOSPriority priority;

    private Double basePriorityScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SOSStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "victim_id")
    private User victim;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "volunteer_id")
    private User volunteer;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
