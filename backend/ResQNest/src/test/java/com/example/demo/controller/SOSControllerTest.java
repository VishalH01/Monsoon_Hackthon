package com.example.demo.controller;

import com.example.demo.entity.SOS;
import com.example.demo.entity.SOSPriority;
import com.example.demo.entity.SOSStatus;
import com.example.demo.service.SOSService;
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
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class SOSControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SOSService sosService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "victim1", roles = "VICTIM")
    public void createSOS_Multipart_Success() throws Exception {
        SOS mockSos = SOS.builder()
                .id(1L)
                .latitude(12.34)
                .longitude(56.78)
                .description("Help needed")
                .status(SOSStatus.PENDING)
                .priority(SOSPriority.HIGH)
                .build();

        Mockito.when(sosService.createSOS(
                Mockito.eq("victim1"),
                Mockito.eq(12.34),
                Mockito.eq(56.78),
                Mockito.eq("Help needed"),
                Mockito.any(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyBoolean(),
                Mockito.anyBoolean(),
                Mockito.anyBoolean()
        )).thenReturn(mockSos);

        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "test image".getBytes());

        mockMvc.perform(multipart("/sos")
                .file(imageFile)
                .param("latitude", "12.34")
                .param("longitude", "56.78")
                .param("description", "Help needed")
                .param("age", "30")
                .param("severity", "5")
                .param("hasChildren", "false")
                .param("isMedicalEmergency", "true")
                .param("isDisabled", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.latitude").value(12.34))
                .andExpect(jsonPath("$.priority").value("HIGH"));
    }

    @Test
    @WithMockUser(username = "victim1", roles = "VICTIM")
    public void createSOS_Json_Success() throws Exception {
        SOS mockSos = SOS.builder()
                .id(2L)
                .latitude(12.34)
                .longitude(56.78)
                .description("JSON Help")
                .status(SOSStatus.PENDING)
                .priority(SOSPriority.LOW)
                .build();

        Mockito.when(sosService.createSOS(
                Mockito.eq("victim1"),
                Mockito.eq(12.34),
                Mockito.eq(56.78),
                Mockito.eq("JSON Help"),
                Mockito.isNull(),
                Mockito.eq(30),
                Mockito.eq(1),
                Mockito.eq(false),
                Mockito.eq(false),
                Mockito.eq(false)
        )).thenReturn(mockSos);

        SOSController.SOSCreateRequest request = new SOSController.SOSCreateRequest(
                12.34, 56.78, "JSON Help", 30, 1, false, false, false);

        mockMvc.perform(post("/sos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.description").value("JSON Help"));
    }

    @Test
    @WithMockUser(username = "admin1", roles = "ADMIN")
    public void getAllSOS_AsAdmin_Success() throws Exception {
        SOS mockSos = SOS.builder()
                .id(1L)
                .status(SOSStatus.PENDING)
                .priority(SOSPriority.HIGH)
                .build();

        Mockito.when(sosService.getAllSOS()).thenReturn(List.of(mockSos));

        mockMvc.perform(get("/sos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    @WithMockUser(username = "admin1", roles = "ADMIN")
    public void updateStatus_AsAdmin_Success() throws Exception {
        SOS mockSos = SOS.builder()
                .id(1L)
                .status(SOSStatus.ACTIVE)
                .priority(SOSPriority.HIGH)
                .build();

        Mockito.when(sosService.updateStatus(1L, SOSStatus.ACTIVE)).thenReturn(mockSos);

        mockMvc.perform(put("/sos/1")
                .param("status", "ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(username = "admin1", roles = "ADMIN")
    public void assignVolunteer_AsAdmin_Success() throws Exception {
        SOS mockSos = SOS.builder()
                .id(1L)
                .status(SOSStatus.ASSIGNED)
                .priority(SOSPriority.HIGH)
                .build();

        Mockito.when(sosService.assignVolunteer(1L, 10L)).thenReturn(mockSos);

        mockMvc.perform(put("/sos/1/assign")
                .param("volunteerId", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"));
    }

    @Test
    @WithMockUser(username = "admin1", roles = "ADMIN")
    public void forceUpdatePriorities_AsAdmin_Success() throws Exception {
        mockMvc.perform(post("/priority"))
                .andExpect(status().isOk())
                .andExpect(content().string("Dynamic priorities recalculated and logged successfully!"));

        Mockito.verify(sosService, Mockito.times(1)).autoUpdatePriorities();
    }

    @Test
    @WithMockUser(username = "user1", roles = "USER")
    public void forceUpdatePriorities_AsUser_Forbidden() throws Exception {
        mockMvc.perform(post("/priority"))
                .andExpect(status().isForbidden());
    }
}
