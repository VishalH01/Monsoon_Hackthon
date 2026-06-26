package com.example.demo.websocket;

import com.example.demo.entity.Volunteer;
import com.example.demo.repository.VolunteerRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@RequiredArgsConstructor
@Slf4j
public class LiveUpdatesHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private final VolunteerRepository volunteerRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        log.info("WebSocket connection established: session id {}", session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        log.info("WebSocket connection closed: session id {}, status {}", session.getId(), status);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.debug("Received WebSocket message: {}", payload);

        try {
            JsonNode rootNode = objectMapper.readTree(payload);
            String type = rootNode.path("type").asText();

            if ("VOLUNTEER_LOCATION".equalsIgnoreCase(type)) {
                JsonNode dataNode = rootNode.path("data");
                long volunteerId = dataNode.path("volunteerId").asLong();
                double latitude = dataNode.path("latitude").asDouble();
                double longitude = dataNode.path("longitude").asDouble();

                updateVolunteerLocation(volunteerId, latitude, longitude);
            }
        } catch (Exception e) {
            log.error("Error processing text message over WebSocket", e);
        }
    }

    private void updateVolunteerLocation(long volunteerId, double latitude, double longitude) {
        try {
            Volunteer volunteer = volunteerRepository.findById(volunteerId).orElse(null);
            if (volunteer != null) {
                volunteer.setLatitude(latitude);
                volunteer.setLongitude(longitude);
                volunteerRepository.save(volunteer);
                log.info("Updated volunteer id {} location to {}, {}", volunteerId, latitude, longitude);

                // Broadcast location update event to all connected clients
                String eventJson = String.format(
                        "{\"type\":\"VOLUNTEER_LOCATION\",\"data\":{\"volunteerId\":%d,\"latitude\":%f,\"longitude\":%f,\"name\":\"%s\"}}",
                        volunteerId, latitude, longitude, volunteer.getName()
                );
                broadcast(eventJson);
            } else {
                log.warn("Received location update for non-existent volunteer id {}", volunteerId);
            }
        } catch (Exception e) {
            log.error("Failed to update volunteer location for ID {}", volunteerId, e);
        }
    }

    public void broadcast(String jsonMessage) {
        log.info("Broadcasting WebSocket message: {}", jsonMessage);
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(jsonMessage));
                } catch (IOException e) {
                    log.error("Error sending message to WebSocket session {}", session.getId(), e);
                }
            } else {
                sessions.remove(session);
            }
        }
    }
    
    public int getActiveSessionCount() {
        return sessions.size();
    }
}
