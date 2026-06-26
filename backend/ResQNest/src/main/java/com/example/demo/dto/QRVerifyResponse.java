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
public class QRVerifyResponse {
    private Boolean success;
    private String message;
    private Long resolvedSosId;
    private LocalDateTime resolvedAt;
}
