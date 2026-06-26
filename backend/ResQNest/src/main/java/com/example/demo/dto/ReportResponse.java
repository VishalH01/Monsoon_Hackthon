package com.example.demo.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
    // Volunteers
    private long totalVolunteers;
    private long availableVolunteers;
    private long busyVolunteers;
    private long unavailableVolunteers;

    // Shelters
    private long totalShelters;
    private long shelterTotalCapacity;
    private long shelterTotalOccupied;
    private long shelterAvailableBeds;
    private long activeShelters;
    private long fullShelters;
    private long inactiveShelters;

    // Inventory
    private long totalInventoryItems;
    private long totalInventoryQuantity;
    private long inStockInventoryItems;
    private long lowStockInventoryItems;
    private long outOfStockInventoryItems;

    // Donations
    private long totalDonations;
    private double totalDonatedAmount;
    private long totalDonatedItemsQuantity;

    // Distributions
    private long totalDistributions;
    private long completedDistributions;
    private long pendingDistributions;
    private long cancelledDistributions;

    // Missing Persons
    private long totalMissingReports;
    private long missingPersons;
    private long foundPersons;
    private long reunitedPersons;
}
