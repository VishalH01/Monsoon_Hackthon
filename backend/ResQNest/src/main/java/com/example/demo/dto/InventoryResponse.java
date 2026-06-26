package com.example.demo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {
    private Long id;
    private String itemName;
    private String category;
    private Integer quantity;
    private String unit;
    private String status;
    private Integer threshold;
    private String warehouseLocation;
    private Double pct;
    private Long shelterId;
    private String shelterName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
