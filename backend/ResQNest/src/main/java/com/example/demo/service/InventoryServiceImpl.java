package com.example.demo.service;

import com.example.demo.dto.InventoryRequest;
import com.example.demo.dto.InventoryResponse;
import com.example.demo.entity.Inventory;
import com.example.demo.entity.Shelter;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.InventoryMapper;
import com.example.demo.repository.InventoryRepository;
import com.example.demo.repository.ShelterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ShelterRepository shelterRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    @Transactional
    public InventoryResponse createInventory(InventoryRequest request) {
        Shelter shelter = null;
        if (request.getShelterId() != null) {
            shelter = shelterRepository.findById(request.getShelterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + request.getShelterId()));
        }
        
        Inventory inventory = inventoryMapper.toEntity(request, shelter);
        Inventory savedInventory = inventoryRepository.save(inventory);
        return inventoryMapper.toResponse(savedInventory);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryById(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        return inventoryMapper.toResponse(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllInventories(String category, String status, Long shelterId) {
        List<Inventory> inventories;
        if (category != null && !category.trim().isEmpty()) {
            inventories = inventoryRepository.findByCategory(category);
        } else if (status != null && !status.trim().isEmpty()) {
            inventories = inventoryRepository.findByStatus(status);
        } else if (shelterId != null) {
            inventories = inventoryRepository.findByShelterId(shelterId);
        } else {
            inventories = inventoryRepository.findAll();
        }
        return inventories.stream()
                .map(inventoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InventoryResponse updateInventory(Long id, InventoryRequest request) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        
        Shelter shelter = null;
        if (request.getShelterId() != null) {
            shelter = shelterRepository.findById(request.getShelterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + request.getShelterId()));
        }
        
        inventoryMapper.updateEntityFromRequest(request, inventory, shelter);
        Inventory updatedInventory = inventoryRepository.save(inventory);
        return inventoryMapper.toResponse(updatedInventory);
    }

    @Override
    @Transactional
    public InventoryResponse updateQuantity(Long id, Integer quantity) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }
        
        inventory.setQuantity(quantity);
        Inventory updatedInventory = inventoryRepository.save(inventory);
        return inventoryMapper.toResponse(updatedInventory);
    }

    @Override
    @Transactional
    public void deleteInventory(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        inventoryRepository.delete(inventory);
    }
}
