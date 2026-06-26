package com.example.demo.service;

import com.example.demo.dto.SOSResponse;

public interface WebSocketService {
    void broadcastNewSOS(SOSResponse alert);
    void broadcastVolunteerAccepted(SOSResponse alert);
    void broadcastReliefDelivered(SOSResponse alert);
    void broadcastDashboardUpdate();
}
