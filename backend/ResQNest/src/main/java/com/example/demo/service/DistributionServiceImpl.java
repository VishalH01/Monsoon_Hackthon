package com.example.demo.service;

import com.example.demo.dto.DistributionRequest;
import com.example.demo.dto.DistributionResponse;
import com.example.demo.entity.Distribution;
import com.example.demo.entity.Inventory;
import com.example.demo.entity.Volunteer;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.DistributionMapper;
import com.example.demo.repository.DistributionRepository;
import com.example.demo.repository.InventoryRepository;
import com.example.demo.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DistributionServiceImpl implements DistributionService {

    private final DistributionRepository distributionRepository;
    private final InventoryRepository inventoryRepository;
    private final VolunteerRepository volunteerRepository;
    private final DistributionMapper distributionMapper;

    @Override
    @Transactional
    public DistributionResponse createDistribution(DistributionRequest request) {
        Inventory inventory = inventoryRepository.findById(request.getInventoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + request.getInventoryId()));
        
        Volunteer volunteer = null;
        if (request.getVolunteerId() != null) {
            volunteer = volunteerRepository.findById(request.getVolunteerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + request.getVolunteerId()));
        }

        // Validate and apply stock change
        String status = request.getStatus() != null ? request.getStatus() : "PENDING";
        if ("COMPLETED".equals(status)) {
            if (inventory.getQuantity() < request.getQuantity()) {
                throw new IllegalArgumentException("Insufficient inventory quantity available. Available: " 
                        + inventory.getQuantity() + ", Requested: " + request.getQuantity());
            }
            inventory.setQuantity(inventory.getQuantity() - request.getQuantity());
            inventoryRepository.save(inventory);
        }

        Distribution distribution = distributionMapper.toEntity(request, inventory, volunteer);
        Distribution savedDistribution = distributionRepository.save(distribution);
        return distributionMapper.toResponse(savedDistribution);
    }

    @Override
    @Transactional(readOnly = true)
    public DistributionResponse getDistributionById(Long id) {
        Distribution distribution = distributionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Distribution record not found with id: " + id));
        return distributionMapper.toResponse(distribution);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DistributionResponse> getAllDistributions(String status, Long inventoryId, Long volunteerId) {
        List<Distribution> distributions;
        if (status != null && !status.trim().isEmpty()) {
            distributions = distributionRepository.findByStatus(status);
        } else if (inventoryId != null) {
            distributions = distributionRepository.findByInventoryId(inventoryId);
        } else if (volunteerId != null) {
            distributions = distributionRepository.findByVolunteerId(volunteerId);
        } else {
            distributions = distributionRepository.findAll();
        }
        return distributions.stream()
                .map(distributionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DistributionResponse updateDistribution(Long id, DistributionRequest request) {
        Distribution distribution = distributionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Distribution record not found with id: " + id));

        Inventory oldInventory = distribution.getInventory();
        int oldQuantity = distribution.getQuantity();
        String oldStatus = distribution.getStatus();

        // Resolve new inventory
        Inventory newInventory = inventoryRepository.findById(request.getInventoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + request.getInventoryId()));

        Volunteer newVolunteer = null;
        if (request.getVolunteerId() != null) {
            newVolunteer = volunteerRepository.findById(request.getVolunteerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + request.getVolunteerId()));
        }

        String newStatus = request.getStatus() != null ? request.getStatus() : distribution.getStatus();
        int newQuantity = request.getQuantity() != null ? request.getQuantity() : distribution.getQuantity();

        // Stock handling logic
        // 1. If old status was COMPLETED, temporarily refund old stock to the old inventory
        if ("COMPLETED".equals(oldStatus)) {
            oldInventory.setQuantity(oldInventory.getQuantity() + oldQuantity);
            inventoryRepository.save(oldInventory);
        }

        // 2. If new status is COMPLETED, deduct new stock from the new inventory
        if ("COMPLETED".equals(newStatus)) {
            if (newInventory.getQuantity() < newQuantity) {
                // Rollback refund to old inventory before throwing error
                if ("COMPLETED".equals(oldStatus)) {
                    oldInventory.setQuantity(oldInventory.getQuantity() - oldQuantity);
                    inventoryRepository.save(oldInventory);
                }
                throw new IllegalArgumentException("Insufficient inventory quantity available. Available: " 
                        + newInventory.getQuantity() + ", Requested: " + newQuantity);
            }
            newInventory.setQuantity(newInventory.getQuantity() - newQuantity);
            inventoryRepository.save(newInventory);
        }

        // Map and save
        distributionMapper.updateEntityFromRequest(request, distribution, newInventory, newVolunteer);
        Distribution updatedDistribution = distributionRepository.save(distribution);
        return distributionMapper.toResponse(updatedDistribution);
    }

    @Override
    @Transactional
    public DistributionResponse updateStatus(Long id, String status) {
        Distribution distribution = distributionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Distribution record not found with id: " + id));

        if (!status.equals("PENDING") && !status.equals("COMPLETED") && !status.equals("CANCELLED")) {
            throw new IllegalArgumentException("Invalid status. Must be PENDING, COMPLETED, or CANCELLED");
        }

        String oldStatus = distribution.getStatus();
        Inventory inventory = distribution.getInventory();
        int quantity = distribution.getQuantity();

        if (!oldStatus.equals(status)) {
            if ("COMPLETED".equals(status)) {
                // Moving to completed, deduct stock
                if (inventory.getQuantity() < quantity) {
                    throw new IllegalArgumentException("Insufficient inventory quantity available for completion.");
                }
                inventory.setQuantity(inventory.getQuantity() - quantity);
                inventoryRepository.save(inventory);
            } else if ("COMPLETED".equals(oldStatus)) {
                // Moving away from completed, refund stock
                inventory.setQuantity(inventory.getQuantity() + quantity);
                inventoryRepository.save(inventory);
            }
            distribution.setStatus(status);
        }

        Distribution updatedDistribution = distributionRepository.save(distribution);
        return distributionMapper.toResponse(updatedDistribution);
    }

    @Override
    @Transactional
    public void deleteDistribution(Long id) {
        Distribution distribution = distributionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Distribution record not found with id: " + id));

        // If completed, refund stock back to inventory upon deletion
        if ("COMPLETED".equals(distribution.getStatus())) {
            Inventory inventory = distribution.getInventory();
            inventory.setQuantity(inventory.getQuantity() + distribution.getQuantity());
            inventoryRepository.save(inventory);
        }

        distributionRepository.delete(distribution);
    }
}
