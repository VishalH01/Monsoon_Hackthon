package com.example.demo.controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class WebSocketLiveTest {

    @LocalServerPort
    private int port;

    @Test
    public void testWebSocketConnectionAndBroadcast() throws Exception {
        StandardWebSocketClient client = new StandardWebSocketClient();
        
        BlockingQueue<String> messageQueue = new ArrayBlockingQueue<>(1);
        
        WebSocketSession session = client.execute(new TextWebSocketHandler() {
            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                messageQueue.offer(message.getPayload());
            }
        }, "ws://localhost:" + port + "/ws/live").get(10, TimeUnit.SECONDS);

        assertThat(session.isOpen()).isTrue();

        // Send a location report from client
        String locationReport = "{\"type\":\"VOLUNTEER_LOCATION\",\"data\":{\"volunteerId\":1,\"latitude\":12.3456,\"longitude\":76.5432}}";
        session.sendMessage(new TextMessage(locationReport));

        // Expect the broadcast of the location update
        String received = messageQueue.poll(10, TimeUnit.SECONDS);
        assertThat(received).isNotNull();
        assertThat(received).contains("VOLUNTEER_LOCATION");
        assertThat(received).contains("12.3456");
        assertThat(received).contains("76.5432");

        session.close();
    }
}
