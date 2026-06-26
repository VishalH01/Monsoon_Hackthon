package com.example.demo.service;

import com.example.demo.dto.ShelterRequest;
import com.example.demo.dto.ShelterResponse;
import com.example.demo.entity.Shelter;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.ShelterMapper;
import com.example.demo.repository.ShelterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShelterServiceImpl implements ShelterService {

    private final ShelterRepository shelterRepository;
    private final ShelterMapper shelterMapper;

    @Override
    @Transactional
    public ShelterResponse createShelter(ShelterRequest request) {
        if (request.getOccupied() != null && request.getOccupied() > request.getCapacity()) {
            throw new IllegalArgumentException("Occupied count cannot exceed total capacity");
        }
        Shelter shelter = shelterMapper.toEntity(request);
        Shelter savedShelter = shelterRepository.save(shelter);
        return shelterMapper.toResponse(savedShelter);
    }

    @Override
    @Transactional(readOnly = true)
    public ShelterResponse getShelterById(Long id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));
        return shelterMapper.toResponse(shelter);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShelterResponse> getAllShelters(String status, String name) {
        List<Shelter> shelters;
        if (status != null && !status.trim().isEmpty()) {
            shelters = shelterRepository.findByStatus(status);
        } else if (name != null && !name.trim().isEmpty()) {
            shelters = shelterRepository.findByNameContainingIgnoreCase(name);
        } else {
            shelters = shelterRepository.findAll();
        }
        return shelters.stream()
                .map(shelterMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShelterResponse updateShelter(Long id, ShelterRequest request) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));
        
        Integer targetCapacity = request.getCapacity() != null ? request.getCapacity() : shelter.getCapacity();
        Integer targetOccupied = request.getOccupied() != null ? request.getOccupied() : shelter.getOccupied();
        
        if (targetOccupied > targetCapacity) {
            throw new IllegalArgumentException("Occupied count cannot exceed total capacity");
        }
        
        shelterMapper.updateEntityFromRequest(request, shelter);
        
        // Auto-update status if it becomes full
        if (shelter.getOccupied().equals(shelter.getCapacity())) {
            shelter.setStatus("FULL");
        } else if ("FULL".equals(shelter.getStatus()) && shelter.getOccupied() < shelter.getCapacity()) {
            shelter.setStatus("ACTIVE");
        }

        Shelter updatedShelter = shelterRepository.save(shelter);
        return shelterMapper.toResponse(updatedShelter);
    }

    @Override
    @Transactional
    public ShelterResponse updateOccupiedCount(Long id, Integer occupied) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));
        
        if (occupied < 0) {
            throw new IllegalArgumentException("Occupied count cannot be negative");
        }
        if (occupied > shelter.getCapacity()) {
            throw new IllegalArgumentException("Occupied count cannot exceed capacity (" + shelter.getCapacity() + ")");
        }
        
        shelter.setOccupied(occupied);
        
        // Auto update status if full or active
        if (occupied.equals(shelter.getCapacity())) {
            shelter.setStatus("FULL");
        } else if ("FULL".equals(shelter.getStatus()) && occupied < shelter.getCapacity()) {
            shelter.setStatus("ACTIVE");
        }
        
        Shelter updatedShelter = shelterRepository.save(shelter);
        return shelterMapper.toResponse(updatedShelter);
    }

    @Override
    @Transactional
    public void deleteShelter(Long id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));
        shelterRepository.delete(shelter);
    }
}
