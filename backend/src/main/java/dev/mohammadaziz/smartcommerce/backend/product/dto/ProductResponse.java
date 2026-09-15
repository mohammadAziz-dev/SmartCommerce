package dev.mohammadaziz.smartcommerce.backend.product.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        UUID businessId,
        String name,
        String description,
        String sku,
        BigDecimal sellingPrice,
        String category,
        boolean active
) {
}
