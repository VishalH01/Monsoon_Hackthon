package com.example.demo.service;

import com.example.demo.dto.ShelterRequest;
import com.example.demo.dto.ShelterResponse;
import java.util.List;

public interface ShelterService {
    ShelterResponse createShelter(ShelterRequest request);
    ShelterResponse getShelterById(Long id);
    List<ShelterResponse> getAllShelters(String status, String name);
    ShelterResponse updateShelter(Long id, ShelterRequest request);
    ShelterResponse updateOccupiedCount(Long id, Integer occupied);
    void deleteShelter(Long id);
}
