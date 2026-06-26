package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsResponse {
    private String avgResponse;
    private long livesImpacted;
    private int countries;
    private long volunteers;
}
