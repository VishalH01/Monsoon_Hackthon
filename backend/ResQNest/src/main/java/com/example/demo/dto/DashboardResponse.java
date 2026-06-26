package com.example.demo.dto;

import com.example.demo.entity.Inventory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    // Basic requested metrics
    private Long activeSOSCount;
    private Long resolvedSOSCount;
    private Long volunteersOnline;
    private Long sheltersAvailable;
    private Long inventoryAlertsCount;

    // Advanced added metrics
    private Double shelterOccupancyRate; // Total occupancy percentage
    private Long activeMissionsCount;     // SOS alerts in ACTIVE state
    private List<Inventory> criticalInventoryAlerts; // List of actual items running low
    private List<SOSResponse> recentSOSAlerts;       // 5 most recent emergency alerts
}
