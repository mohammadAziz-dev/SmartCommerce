package dev.mohammadaziz.smartcommerce.backend.inventory.dto;

import jakarta.validation.constraints.Min;

public record StockAdjustmentRequest(

        @Min(1)
        int amount
) {
}