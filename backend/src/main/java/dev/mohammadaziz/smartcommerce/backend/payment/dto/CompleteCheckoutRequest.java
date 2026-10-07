package dev.mohammadaziz.smartcommerce.backend.payment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CompleteCheckoutRequest(
        @NotBlank String paymentIntentId,
        @NotEmpty List<@Valid PaymentItemRequest> items
) {
}