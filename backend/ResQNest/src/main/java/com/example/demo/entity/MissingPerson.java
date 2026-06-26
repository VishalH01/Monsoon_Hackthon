package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "missing_persons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissingPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private Integer age;

    private String gender;

    @Column(name = "last_seen_location")
    private String lastSeenLocation;

    private Double latitude;

    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String photoUrl;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(nullable = false)
    private String status; // "MISSING", "FOUND", "REUNITED"

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "MISSING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
