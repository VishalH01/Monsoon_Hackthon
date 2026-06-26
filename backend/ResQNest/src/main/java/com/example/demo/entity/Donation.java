package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "donor_name", nullable = false)
    private String donorName;

    @Column(name = "donor_email", nullable = false)
    private String donorEmail;

    @Column(name = "donation_type", nullable = false)
    private String donationType; // "MONEY" or "ITEMS"

    private Double amount; // Nullable if type is ITEMS

    @Column(name = "item_name")
    private String itemName; // Nullable if type is MONEY

    private Integer quantity; // Nullable if type is MONEY

    private String unit; // Nullable if type is MONEY

    @Column(nullable = false)
    private String status; // "PENDING", "RECEIVED", "DISTRIBUTED"

    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
