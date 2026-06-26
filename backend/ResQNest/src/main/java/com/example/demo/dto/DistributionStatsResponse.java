package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributionStatsResponse {
    private long pendingDistributions;
    private long highPriorityDistributions;
    private long completedDistributions;
    private long todaysDeliveries;
}
