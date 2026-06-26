package com.example.demo.controller;

import com.example.demo.dto.QRGenerateResponse;
import com.example.demo.dto.QRVerifyRequest;
import com.example.demo.dto.QRVerifyResponse;
import com.example.demo.service.QRService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/qr")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class QRController {

    private final QRService qrService;

    @PostMapping("/generate/{sosId}")
    @PreAuthorize("hasRole('VICTIM') or hasRole('ADMIN')")
    public ResponseEntity<QRGenerateResponse> generateQR(
            @PathVariable Long sosId,
            Principal principal) {
        QRGenerateResponse response = qrService.generateQR(sosId, principal.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<QRVerifyResponse> verifyQR(
            @Valid @RequestBody QRVerifyRequest request,
            Principal principal) {
        QRVerifyResponse response = qrService.verifyQRAndResolve(request.getSosId(), request.getToken(), principal.getName());
        return ResponseEntity.ok(response);
    }
}
