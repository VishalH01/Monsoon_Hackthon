package com.example.demo.controller;

import com.example.demo.dto.StripeSessionResponse;
import com.example.demo.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentService paymentService;

    @Test
    public void createCheckoutSession_Success() throws Exception {
        StripeSessionResponse mockResponse = StripeSessionResponse.builder()
                .sessionId("cs_test_123")
                .checkoutUrl("https://checkout.stripe.com/pay/cs_test_123")
                .status("unpaid")
                .donationId(5L)
                .amount(150.0)
                .build();

        Mockito.when(paymentService.createCheckoutSession(5L)).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/payments/create-session/5")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value("cs_test_123"))
                .andExpect(jsonPath("$.checkoutUrl").value("https://checkout.stripe.com/pay/cs_test_123"))
                .andExpect(jsonPath("$.donationId").value(5))
                .andExpect(jsonPath("$.amount").value(150.0));
    }

    @Test
    public void verifyRedirectPayment_Success() throws Exception {
        Mockito.when(paymentService.verifyRedirectPayment("cs_test_123", 5L)).thenReturn(true);

        mockMvc.perform(get("/api/v1/payments/success")
                .param("session_id", "cs_test_123")
                .param("donation_id", "5"))
                .andExpect(status().isOk())
                .andExpect(content().string("Thank you! Your monetary relief donation has been verified and successfully processed."));
    }

    @Test
    public void verifyRedirectPayment_Unpaid() throws Exception {
        Mockito.when(paymentService.verifyRedirectPayment("cs_test_123", 5L)).thenReturn(false);

        mockMvc.perform(get("/api/v1/payments/success")
                .param("session_id", "cs_test_123")
                .param("donation_id", "5"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Stripe checkout session is unpaid or incomplete."));
    }

    @Test
    public void handleStripeWebhook_Success() throws Exception {
        Mockito.doNothing().when(paymentService).processWebhook(Mockito.anyString(), Mockito.anyString());

        mockMvc.perform(post("/api/v1/payments/webhook")
                .header("Stripe-Signature", "sig_header_mock")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\": \"evt_test_123\", \"type\": \"checkout.session.completed\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("Webhook processed successfully."));
    }

    @Test
    public void handleStripeWebhook_Failure() throws Exception {
        Mockito.doThrow(new RuntimeException("Invalid Signature")).when(paymentService)
                .processWebhook(Mockito.anyString(), Mockito.anyString());

        mockMvc.perform(post("/api/v1/payments/webhook")
                .header("Stripe-Signature", "sig_header_invalid")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"invalid\": \"payload\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Invalid Signature"));
    }
}
