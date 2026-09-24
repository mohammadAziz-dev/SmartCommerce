package dev.mohammadaziz.smartcommerce.backend.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID productId,
        String productName,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}