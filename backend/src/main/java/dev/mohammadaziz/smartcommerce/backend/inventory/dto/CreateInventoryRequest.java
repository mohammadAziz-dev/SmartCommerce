package dev.mohammadaziz.smartcommerce.backend.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateInventoryRequest(

        @NotNull
        UUID productId,

        @Min(0)
        int quantity,

        @Min(0)
        int lowStockThreshold
) {
}