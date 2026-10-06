package dev.mohammadaziz.smartcommerce.backend.inventory.dto;

import java.util.UUID;

public record InventoryChangedEvent(
        UUID businessId,
        UUID productId,
        int quantity
) {
}