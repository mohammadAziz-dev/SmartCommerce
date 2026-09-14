package dev.mohammadaziz.smartcommerce.backend.business.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateBusinessRequest(
        @NotBlank(message = "Business name is required")
        String name
) {
}