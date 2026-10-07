package dev.mohammadaziz.smartcommerce.backend.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record PaymentItemRequest(
        @NotNull UUID productId,
        @Positive int quantity
) {
}