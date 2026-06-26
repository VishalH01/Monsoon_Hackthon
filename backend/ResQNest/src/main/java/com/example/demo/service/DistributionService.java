package com.example.demo.service;

import com.example.demo.dto.DistributionRequest;
import com.example.demo.dto.DistributionResponse;
import java.util.List;

public interface DistributionService {
    DistributionResponse createDistribution(DistributionRequest request);
    DistributionResponse getDistributionById(Long id);
    List<DistributionResponse> getAllDistributions(String status, Long inventoryId, Long volunteerId);
    DistributionResponse updateDistribution(Long id, DistributionRequest request);
    DistributionResponse updateStatus(Long id, String status);
    void deleteDistribution(Long id);
}
