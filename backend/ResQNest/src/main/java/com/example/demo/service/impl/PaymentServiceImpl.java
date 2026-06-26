package com.example.demo.service.impl;

import com.example.demo.dto.StripeSessionResponse;
import com.example.demo.entity.Donation;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DonationRepository;
import com.example.demo.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final DonationRepository donationRepository;

    @Value("${resqnest.stripe.api.key}")
    private String stripeApiKey;

    @Value("${resqnest.stripe.webhook.secret}")
    private String webhookSecret;

    @Value("${resqnest.stripe.success.url}")
    private String successUrl;

    @Value("${resqnest.stripe.cancel.url}")
    private String cancelUrl;

    @PostConstruct
    public void init() {
        // Set the Stripe API Key globally for the SDK
        Stripe.apiKey = this.stripeApiKey;
        log.info("Stripe SDK initialized successfully with configured secret API key.");
    }

    @Override
    @Transactional
    public StripeSessionResponse createCheckoutSession(Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + donationId));

        if (!"MONEY".equalsIgnoreCase(donation.getDonationType())) {
            throw new IllegalArgumentException("Error: Only monetary donations can be paid via Stripe!");
        }

        if (!"PENDING".equalsIgnoreCase(donation.getStatus())) {
            throw new IllegalArgumentException("Error: Donation has already been processed! Status: " + donation.getStatus());
        }

        try {
            // Build checkout session configuration
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(String.format(successUrl, donationId))
                    .setCancelUrl(String.format(cancelUrl, donationId))
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("usd")
                                                    .setUnitAmount((long) (donation.getAmount() * 100)) // Amount in cents
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Donation to ResQNest Safety Shelter")
                                                                    .setDescription(String.format("Monetary relief donation by %s (%s)", 
                                                                            donation.getDonorName(), donation.getDonorEmail()))
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .putMetadata("donationId", String.valueOf(donationId))
                    .build();

            Session session = Session.create(params);
            log.info("Successfully created Stripe Checkout Session for Donation ID {}. Session URL: {}", donationId, session.getUrl());

            return StripeSessionResponse.builder()
                    .sessionId(session.getId())
                    .checkoutUrl(session.getUrl())
                    .status(session.getPaymentStatus())
                    .donationId(donationId)
                    .amount(donation.getAmount())
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate Stripe Checkout Session for Donation ID {}", donationId, e);
            throw new RuntimeException("Error communicating with Stripe server: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public boolean verifyRedirectPayment(String sessionId, Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + donationId));

        // If already resolved, return true immediately
        if ("RECEIVED".equalsIgnoreCase(donation.getStatus())) {
            return true;
        }

        try {
            Session session = Session.retrieve(sessionId);
            String metadataDonationId = session.getMetadata().get("donationId");

            if (metadataDonationId == null || !metadataDonationId.equals(String.valueOf(donationId))) {
                throw new IllegalArgumentException("Error: Checkout session metadata does not match target donation ID!");
            }

            if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
                donation.setStatus("RECEIVED");
                donationRepository.save(donation);
                log.info("Donation ID {} successfully marked as RECEIVED via redirect session validation.", donationId);
                return true;
            }

            return false;

        } catch (Exception e) {
            log.error("Failed to verify Stripe Checkout Session {} for Donation ID {}", sessionId, donationId, e);
            throw new RuntimeException("Error verifying payment with Stripe: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void processWebhook(String payload, String sigHeader) {
        try {
            Event event;
            if (webhookSecret == null || webhookSecret.trim().isEmpty() || "whsec_PLACEHOLDER_SECRET".equalsIgnoreCase(webhookSecret.trim())) {
                log.info("Bypassing Stripe signature verification: Webhook secret is not configured or is placeholder.");
                event = com.stripe.net.ApiResource.GSON.fromJson(payload, Event.class);
            } else {
                // Verify webhook signature securely using the configured secret key
                event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
                log.info("Received cryptographically verified Stripe webhook event: {}", event.getType());
            }

            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject()
                        .orElseThrow(() -> new IllegalArgumentException("Invalid checkout session payload in event"));

                String donationIdStr = session.getMetadata().get("donationId");
                if (donationIdStr != null) {
                    Long donationId = Long.parseLong(donationIdStr);
                    Donation donation = donationRepository.findById(donationId).orElse(null);
                    if (donation != null) {
                        if ("PENDING".equalsIgnoreCase(donation.getStatus())) {
                            donation.setStatus("RECEIVED");
                            donationRepository.save(donation);
                            log.info("Donation ID {} successfully updated to RECEIVED via webhook checkout.session.completed event.", donationId);
                        } else {
                            log.info("Donation ID {} already in status {}, ignoring webhook update.", donationId, donation.getStatus());
                        }
                    } else {
                        log.warn("Stripe webhook contains donationId {} but no matching donation found in database.", donationId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to process Stripe Webhook signature or event", e);
            throw new RuntimeException("Error processing Stripe webhook: " + e.getMessage(), e);
        }
    }
}
