package com.example.demo.controller;

import com.example.demo.dto.QRGenerateResponse;
import com.example.demo.dto.QRVerifyRequest;
import com.example.demo.dto.QRVerifyResponse;
import com.example.demo.service.QRService;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class QRControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QRService qrService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "victim1", roles = "VICTIM")
    public void generateQR_AsVictim_Success() throws Exception {
        QRGenerateResponse mockResponse = QRGenerateResponse.builder()
                .sosId(12L)
                .token("mock-uuid-token")
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .qrCodeImageBase64("data:image/png;base64,mockBase64String")
                .build();

        Mockito.when(qrService.generateQR(12L, "victim1")).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/qr/generate/12")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sosId").value(12))
                .andExpect(jsonPath("$.token").value("mock-uuid-token"))
                .andExpect(jsonPath("$.qrCodeImageBase64").value("data:image/png;base64,mockBase64String"));
    }

    @Test
    @WithMockUser(username = "volunteer1", roles = "VOLUNTEER")
    public void generateQR_AsVolunteer_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/qr/generate/12")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "volunteer1", roles = "VOLUNTEER")
    public void verifyQR_AsVolunteer_Success() throws Exception {
        QRVerifyRequest request = new QRVerifyRequest(12L, "mock-uuid-token");
        QRVerifyResponse mockResponse = QRVerifyResponse.builder()
                .success(true)
                .message("Verified successfully")
                .resolvedSosId(12L)
                .resolvedAt(LocalDateTime.now())
                .build();

        Mockito.when(qrService.verifyQRAndResolve(12L, "mock-uuid-token", "volunteer1")).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/qr/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Verified successfully"));
    }

    @Test
    @WithMockUser(username = "victim1", roles = "VICTIM")
    public void verifyQR_AsVictim_Forbidden() throws Exception {
        QRVerifyRequest request = new QRVerifyRequest(12L, "mock-uuid-token");
        mockMvc.perform(post("/api/v1/qr/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
