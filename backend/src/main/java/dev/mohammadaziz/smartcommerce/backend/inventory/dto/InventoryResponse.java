package dev.mohammadaziz.smartcommerce.backend.inventory.dto;

import java.util.UUID;

public record InventoryResponse(
        UUID id,
        UUID businessId,
        UUID productId,
        int quantity,
        int lowStockThreshold,
        boolean lowStock
) {
}
