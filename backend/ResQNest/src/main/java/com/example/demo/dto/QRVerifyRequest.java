package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRVerifyRequest {

    @NotNull(message = "SOS ID cannot be null")
    private Long sosId;

    @NotBlank(message = "Token cannot be blank")
    private String token;
}
