package com.example.demo.service;

import com.example.demo.dto.InventoryRequest;
import com.example.demo.dto.InventoryResponse;
import java.util.List;

public interface InventoryService {
    InventoryResponse createInventory(InventoryRequest request);
    InventoryResponse getInventoryById(Long id);
    List<InventoryResponse> getAllInventories(String category, String status, Long shelterId);
    InventoryResponse updateInventory(Long id, InventoryRequest request);
    InventoryResponse updateQuantity(Long id, Integer quantity);
    void deleteInventory(Long id);
}
