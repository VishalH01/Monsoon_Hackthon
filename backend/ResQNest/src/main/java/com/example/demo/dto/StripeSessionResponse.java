package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StripeSessionResponse {
    private String sessionId;
    private String checkoutUrl;
    private String status;
    private Long donationId;
    private Double amount;
}
