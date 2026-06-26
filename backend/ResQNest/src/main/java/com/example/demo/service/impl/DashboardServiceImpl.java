package com.example.demo.service.impl;

import com.example.demo.dto.DashboardResponse;
import com.example.demo.dto.SOSResponse;
import com.example.demo.entity.Inventory;
import com.example.demo.entity.SOS;
import com.example.demo.entity.SOSStatus;
import com.example.demo.entity.Shelter;
import com.example.demo.entity.Volunteer;
import com.example.demo.repository.InventoryRepository;
import com.example.demo.repository.SOSRepository;
import com.example.demo.repository.ShelterRepository;
import com.example.demo.repository.VolunteerRepository;
import com.example.demo.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final SOSRepository sosRepository;
    private final VolunteerRepository volunteerRepository;
    private final ShelterRepository shelterRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public DashboardResponse getDashboardStats() {
        List<SOS> allSos = sosRepository.findAll();
        List<Shelter> allShelters = shelterRepository.findAll();
        List<Volunteer> availableVolunteers = volunteerRepository.findByStatus("AVAILABLE");
        List<Inventory> lowStockSupplies = inventoryRepository.findLowStockAlerts();

        // 1. SOS Counts
        long activeSosCount = allSos.stream()
                .filter(sos -> sos.getStatus() != SOSStatus.RESOLVED)
                .count();

        long resolvedSosCount = allSos.stream()
                .filter(sos -> sos.getStatus() == SOSStatus.RESOLVED)
                .count();

        long activeMissionsCount = allSos.stream()
                .filter(sos -> sos.getStatus() == SOSStatus.ACTIVE)
                .count();

        // 2. Volunteers Count
        long volunteersCount = availableVolunteers.size();

        // 3. Shelters Available (Active shelters that are not completely full)
        long sheltersAvailableCount = allShelters.stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()) && s.getOccupied() < s.getCapacity())
                .count();

        // 4. Shelter Occupancy Percentage
        int totalCapacity = allShelters.stream().mapToInt(Shelter::getCapacity).sum();
        int totalOccupied = allShelters.stream().mapToInt(Shelter::getOccupied).sum();
        double occupancyRate = (totalCapacity > 0) ? ((double) totalOccupied / totalCapacity) * 100.0 : 0.0;
        // Round to 1 decimal place
        occupancyRate = Math.round(occupancyRate * 10.0) / 10.0;

        // 5. Recent SOS Alerts (Last 5)
        List<SOSResponse> recentSosList = allSos.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(SOSResponse::fromEntity)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .activeSOSCount(activeSosCount)
                .resolvedSOSCount(resolvedSosCount)
                .activeMissionsCount(activeMissionsCount)
                .volunteersOnline(volunteersCount)
                .sheltersAvailable(sheltersAvailableCount)
                .shelterOccupancyRate(occupancyRate)
                .inventoryAlertsCount((long) lowStockSupplies.size())
                .criticalInventoryAlerts(lowStockSupplies)
                .recentSOSAlerts(recentSosList)
                .build();
    }
}
