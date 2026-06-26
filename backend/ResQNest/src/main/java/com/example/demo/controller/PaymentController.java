package com.example.demo.controller;

import com.example.demo.dto.StripeSessionResponse;
import com.example.demo.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-session/{donationId}")
    public ResponseEntity<StripeSessionResponse> createCheckoutSession(@PathVariable Long donationId) {
        log.info("Request to create Stripe Checkout Session for Donation ID: {}", donationId);
        StripeSessionResponse response = paymentService.createCheckoutSession(donationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/success")
    public ResponseEntity<String> verifyRedirectPayment(
            @RequestParam("session_id") String sessionId,
            @RequestParam("donation_id") Long donationId) {
        log.info("Request to verify Stripe Redirect Payment for Session ID: {}, Donation ID: {}", sessionId, donationId);
        boolean verified = paymentService.verifyRedirectPayment(sessionId, donationId);
        if (verified) {
            return ResponseEntity.ok("Thank you! Your monetary relief donation has been verified and successfully processed.");
        } else {
            return ResponseEntity.badRequest().body("Error: Stripe checkout session is unpaid or incomplete.");
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        log.info("Received Stripe Webhook notification request.");
        try {
            paymentService.processWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook processed successfully.");
        } catch (Exception e) {
            log.error("Failed to parse and process incoming Stripe Webhook", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
