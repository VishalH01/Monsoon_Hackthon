package com.example.demo.controller;

import com.example.demo.dto.DashboardResponse;
import com.example.demo.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

    @Test
    @WithMockUser(roles = "ADMIN")
    public void getDashboard_Admin_Success() throws Exception {
        DashboardResponse mockResponse = DashboardResponse.builder()
                .activeSOSCount(5L)
                .resolvedSOSCount(10L)
                .volunteersOnline(3L)
                .sheltersAvailable(2L)
                .inventoryAlertsCount(1L)
                .shelterOccupancyRate(45.5)
                .activeMissionsCount(2L)
                .build();

        Mockito.when(dashboardService.getDashboardStats()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/dashboard")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeSOSCount").value(5))
                .andExpect(jsonPath("$.resolvedSOSCount").value(10))
                .andExpect(jsonPath("$.volunteersOnline").value(3))
                .andExpect(jsonPath("$.sheltersAvailable").value(2))
                .andExpect(jsonPath("$.inventoryAlertsCount").value(1))
                .andExpect(jsonPath("$.shelterOccupancyRate").value(45.5))
                .andExpect(jsonPath("$.activeMissionsCount").value(2));
    }

    @Test
    @WithMockUser(roles = "NGO")
    public void getDashboard_Ngo_Success() throws Exception {
        DashboardResponse mockResponse = DashboardResponse.builder()
                .activeSOSCount(1L)
                .resolvedSOSCount(1L)
                .volunteersOnline(1L)
                .sheltersAvailable(1L)
                .inventoryAlertsCount(0L)
                .shelterOccupancyRate(10.0)
                .activeMissionsCount(1L)
                .build();

        Mockito.when(dashboardService.getDashboardStats()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/dashboard")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeSOSCount").value(1))
                .andExpect(jsonPath("$.shelterOccupancyRate").value(10.0));
    }

    @Test
    @WithMockUser(roles = "VICTIM")
    public void getDashboard_Victim_Forbidden() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    public void getDashboard_Unauthenticated_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
