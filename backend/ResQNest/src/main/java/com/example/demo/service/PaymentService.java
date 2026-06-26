package com.example.demo.service;

import com.example.demo.dto.StripeSessionResponse;

public interface PaymentService {
    StripeSessionResponse createCheckoutSession(Long donationId);
    boolean verifyRedirectPayment(String sessionId, Long donationId);
    void processWebhook(String payload, String sigHeader);
}
