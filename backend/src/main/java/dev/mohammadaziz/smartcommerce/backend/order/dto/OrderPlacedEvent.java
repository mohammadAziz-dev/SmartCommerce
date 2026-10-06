package dev.mohammadaziz.smartcommerce.backend.order.dto;

public record OrderPlacedEvent(
        String customerEmail,
        String customerName,
        OrderResponse order
) {
}
