package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    private String category;

    @Column(nullable = false)
    private Integer quantity;

    private Integer threshold; // Low stock alert threshold from HEAD

    private String unit;

    @Column(name = "warehouse_location")
    private String warehouseLocation;

    @Column(nullable = false)
    private String status; // "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shelter_id")
    private Shelter shelter;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (quantity == null) {
            quantity = 0;
        }
        if (threshold == null) {
            threshold = 10; // Default threshold
        }
        updateStatus();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (threshold == null) {
            threshold = 10;
        }
        updateStatus();
    }

    private void updateStatus() {
        if (quantity <= 0) {
            status = "critical";
        } else if (quantity <= threshold) {
            status = "low";
        } else {
            status = "healthy";
        }
    }
}
