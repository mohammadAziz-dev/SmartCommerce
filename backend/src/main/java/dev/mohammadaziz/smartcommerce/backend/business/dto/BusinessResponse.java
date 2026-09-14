package dev.mohammadaziz.smartcommerce.backend.business.dto;

import java.util.UUID;

public record BusinessResponse(
        UUID id,
        String name
) {
}