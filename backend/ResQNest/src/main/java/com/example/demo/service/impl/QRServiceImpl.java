package com.example.demo.service.impl;

import com.example.demo.dto.QRGenerateResponse;
import com.example.demo.dto.QRVerifyResponse;
import com.example.demo.dto.SOSResponse;
import com.example.demo.entity.Role;
import com.example.demo.entity.SOS;
import com.example.demo.entity.SOSStatus;
import com.example.demo.entity.User;
import com.example.demo.entity.QRCode;
import com.example.demo.repository.SOSRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.QRCodeRepository;
import com.example.demo.service.QRService;
import com.example.demo.service.WebSocketService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QRServiceImpl implements QRService {

    private final SOSRepository sosRepository;
    private final UserRepository userRepository;
    private final QRCodeRepository qrCodeRepository;
    private final WebSocketService webSocketService;

    @Override
    @Transactional
    public QRGenerateResponse generateQR(Long sosId, String victimUsername) {
        SOS sos = sosRepository.findById(sosId)
                .orElseThrow(() -> new IllegalArgumentException("Error: SOS alert not found with ID: " + sosId));

        // Security check: Only the victim who raised the alert or an Admin can generate the QR code
        if (victimUsername != null && !victimUsername.trim().isEmpty()) {
            User requestor = userRepository.findByUsername(victimUsername)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + victimUsername));
            if (requestor.getRole() != Role.ADMIN) {
                if (sos.getVictim() == null || !sos.getVictim().getUsername().equals(victimUsername)) {
                    throw new IllegalArgumentException("Error: You are not authorized to generate a QR code for this alert!");
                }
            }
        }

        if (sos.getStatus() == SOSStatus.RESOLVED) {
            throw new IllegalArgumentException("Error: Cannot generate QR code for an already resolved rescue alert!");
        }

        // Delete any existing QR code for this SOS request
        qrCodeRepository.findBySosId(sosId).ifPresent(qrCodeRepository::delete);

        // Generate time-sensitive token and save to qr_codes table
        String token = UUID.randomUUID().toString();
        QRCode qrCode = QRCode.builder()
                .sosId(sosId)
                .token(token)
                .build();
        qrCodeRepository.save(qrCode);

        LocalDateTime expiresAt = qrCode.getExpiresAt();

        // Generate scan payload
        String qrPayload = String.format("{\"sosId\":%d,\"token\":\"%s\"}", sosId, token);
        String qrImageBase64;
        try {
            qrImageBase64 = generateQRCodeImageBase64(qrPayload, 300, 300);
        } catch (Exception e) {
            log.error("Failed to generate ZXing QR Code image for SOS id {}", sosId, e);
            throw new RuntimeException("Error: Failed to generate QR Code image: " + e.getMessage(), e);
        }

        return QRGenerateResponse.builder()
                .sosId(sosId)
                .token(token)
                .expiresAt(expiresAt)
                .qrCodeImageBase64(qrImageBase64)
                .build();
    }

    @Override
    @Transactional
    public QRVerifyResponse verifyQRAndResolve(Long sosId, String token, String volunteerUsername) {
        SOS sos = sosRepository.findById(sosId)
                .orElseThrow(() -> new IllegalArgumentException("Error: SOS alert not found with ID: " + sosId));

        if (sos.getStatus() == SOSStatus.RESOLVED) {
            throw new IllegalArgumentException("Error: Rescue alert is already resolved!");
        }

        QRCode qrCode = qrCodeRepository.findBySosId(sosId)
                .orElseThrow(() -> new IllegalArgumentException("Error: No active QR verification token has been generated for this alert. Please generate a QR code first!"));

        // 1. Verify token match
        if (!qrCode.getToken().equals(token)) {
            throw new IllegalArgumentException("Error: Invalid verification token!");
        }

        // 2. Verify token age (15 mins limit)
        if (LocalDateTime.now().isAfter(qrCode.getExpiresAt())) {
            throw new IllegalArgumentException("Error: QR verification token has expired (15 minutes validity). Please generate a new QR code!");
        }

        // 3. Verify user matches assigned volunteer or Admin
        if (volunteerUsername != null && !volunteerUsername.trim().isEmpty()) {
            User requestor = userRepository.findByUsername(volunteerUsername)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + volunteerUsername));
            if (requestor.getRole() != Role.ADMIN) {
                if (sos.getVolunteer() == null || !sos.getVolunteer().getUsername().equals(volunteerUsername)) {
                    throw new IllegalArgumentException("Error: You are not the assigned volunteer for this rescue mission!");
                }
            }
        }

        // Resolve the SOS alert and delete the QR record
        sos.setStatus(SOSStatus.RESOLVED);
        qrCodeRepository.delete(qrCode); // Delete QR record
        SOS savedSos = sosRepository.save(sos);

        log.info("SOS Alert ID {} successfully verified and resolved via QR Code by volunteer {}", sosId, volunteerUsername);

        // Real-time WebSocket broadcasts
        try {
            SOSResponse response = SOSResponse.fromEntity(savedSos);
            webSocketService.broadcastReliefDelivered(response);
            webSocketService.broadcastDashboardUpdate();
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket real-time updates for QR resolution of SOS id {}", sosId, e);
        }

        return QRVerifyResponse.builder()
                .success(true)
                .message("Relief successfully verified and delivered! Mission completed.")
                .resolvedSosId(sosId)
                .resolvedAt(savedSos.getUpdatedAt())
                .build();
    }

    private String generateQRCodeImageBase64(String text, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        byte[] pngData = pngOutputStream.toByteArray();
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
    }
}
