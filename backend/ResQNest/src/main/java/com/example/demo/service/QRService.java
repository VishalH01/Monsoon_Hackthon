package com.example.demo.service;

import com.example.demo.dto.QRGenerateResponse;
import com.example.demo.dto.QRVerifyResponse;

public interface QRService {
    QRGenerateResponse generateQR(Long sosId, String victimUsername);
    QRVerifyResponse verifyQRAndResolve(Long sosId, String token, String volunteerUsername);
}
