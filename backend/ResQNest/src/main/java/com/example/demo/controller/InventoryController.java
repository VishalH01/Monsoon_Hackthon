package com.example.demo.controller;

import com.example.demo.dto.InventoryRequest;
import com.example.demo.dto.InventoryResponse;
import com.example.demo.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<InventoryResponse> createInventory(@Valid @RequestBody InventoryRequest request) {
        InventoryResponse response = inventoryService.createInventory(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getInventoryById(@PathVariable Long id) {
        InventoryResponse response = inventoryService.getInventoryById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventories(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long shelterId) {
        List<InventoryResponse> response = inventoryService.getAllInventories(category, status, shelterId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryResponse> updateInventory(
            @PathVariable Long id,
            @Valid @RequestBody InventoryRequest request) {
        InventoryResponse response = inventoryService.updateInventory(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/quantity")
    public ResponseEntity<InventoryResponse> updateQuantity(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        InventoryResponse response = inventoryService.updateQuantity(id, quantity);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }
}
