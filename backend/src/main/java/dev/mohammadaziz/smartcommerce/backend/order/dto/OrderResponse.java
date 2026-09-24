package dev.mohammadaziz.smartcommerce.backend.order.dto;

import dev.mohammadaziz.smartcommerce.backend.order.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        UUID businessId,
        OrderStatus status,
        BigDecimal totalPrice,
        Instant createdAt,
        List<OrderItemResponse> items
) {
}