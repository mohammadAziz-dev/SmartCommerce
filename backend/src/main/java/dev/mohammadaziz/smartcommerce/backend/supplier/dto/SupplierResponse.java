package dev.mohammadaziz.smartcommerce.backend.supplier.dto;

import java.util.UUID;

public record SupplierResponse(
        UUID id,
        UUID businessId,
        String name,
        String email,
        String phone,
        String country,
        String preferredCurrency
) {
}