package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRGenerateResponse {
    private Long sosId;
    private String token;
    private LocalDateTime expiresAt;
    private String qrCodeImageBase64;
}
