package dev.mohammadaziz.smartcommerce.backend.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateProductRequest(

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
