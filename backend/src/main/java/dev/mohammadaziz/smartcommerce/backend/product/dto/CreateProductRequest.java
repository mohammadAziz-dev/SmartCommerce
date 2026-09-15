package dev.mohammadaziz.smartcommerce.backend.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateProductRequest(

        @NotNull(message = "Business ID is required")
        UUID businessId,

        @NotBlank(message = "Product name is required")
        String name,

        String description,

        String sku,

        @NotNull(message = "Selling price is required")
        @DecimalMin(value = "0.0", message = "Selling price cannot be negative")
        BigDecimal sellingPrice,

        String category,

        boolean active
) {
}
