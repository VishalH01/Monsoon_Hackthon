package com.example.demo.mapper;

import com.example.demo.dto.InventoryRequest;
import com.example.demo.dto.InventoryResponse;
import com.example.demo.entity.Inventory;
import com.example.demo.entity.Shelter;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public Inventory toEntity(InventoryRequest request, Shelter shelter) {
        if (request == null) {
            return null;
        }
        return Inventory.builder()
                .itemName(request.getItemName())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .shelter(shelter)
                .build();
    }

    public InventoryResponse toResponse(Inventory inventory) {
        if (inventory == null) {
            return null;
        }
        Long shelterId = null;
        String shelterName = null;
        if (inventory.getShelter() != null) {
            shelterId = inventory.getShelter().getId();
            shelterName = inventory.getShelter().getName();
        }
        return InventoryResponse.builder()
                .id(inventory.getId())
                .itemName(inventory.getItemName())
                .category(inventory.getCategory())
                .quantity(inventory.getQuantity())
                .unit(inventory.getUnit())
                .status(inventory.getStatus())
                .shelterId(shelterId)
                .shelterName(shelterName)
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(InventoryRequest request, Inventory inventory, Shelter shelter) {
        if (request == null || inventory == null) {
            return;
        }
        if (request.getItemName() != null) {
            inventory.setItemName(request.getItemName());
        }
        if (request.getCategory() != null) {
            inventory.setCategory(request.getCategory());
        }
        if (request.getQuantity() != null) {
            inventory.setQuantity(request.getQuantity());
        }
        if (request.getUnit() != null) {
            inventory.setUnit(request.getUnit());
        }
        // Always assign the resolved shelter (can be null)
        inventory.setShelter(shelter);
    }
}
