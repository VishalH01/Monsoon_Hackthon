package com.example.demo.service.impl;

import com.example.demo.dto.DashboardResponse;
import com.example.demo.dto.SOSResponse;
import com.example.demo.service.DashboardService;
import com.example.demo.service.WebSocketService;
import com.example.demo.websocket.LiveUpdatesHandler;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketServiceImpl implements WebSocketService {

    private final LiveUpdatesHandler liveUpdatesHandler;
    private final DashboardService dashboardService;
    private final ObjectMapper objectMapper;

    @Override
    public void broadcastNewSOS(SOSResponse alert) {
        broadcastEvent("NEW_SOS", alert);
    }

    @Override
    public void broadcastVolunteerAccepted(SOSResponse alert) {
        broadcastEvent("VOLUNTEER_ACCEPTED", alert);
    }

    @Override
    public void broadcastReliefDelivered(SOSResponse alert) {
        broadcastEvent("RELIEF_DELIVERED", alert);
    }

    @Override
    public void broadcastDashboardUpdate() {
        try {
            DashboardResponse stats = dashboardService.getDashboardStats();
            broadcastEvent("DASHBOARD_UPDATE", stats);
        } catch (Exception e) {
            log.error("Failed to fetch dashboard stats for real-time broadcast", e);
        }
    }

    private void broadcastEvent(String eventType, Object data) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", eventType);
            message.put("data", data);

            String json = objectMapper.writeValueAsString(message);
            liveUpdatesHandler.broadcast(json);
        } catch (Exception e) {
            log.error("Failed to serialize WebSocket event of type {}", eventType, e);
        }
    }
}
