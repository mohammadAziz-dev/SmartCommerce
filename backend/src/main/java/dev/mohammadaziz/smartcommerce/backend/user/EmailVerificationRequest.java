package dev.mohammadaziz.smartcommerce.backend.user;

import jakarta.validation.constraints.NotBlank;

public record EmailVerificationRequest(
        @NotBlank String token
) {
}