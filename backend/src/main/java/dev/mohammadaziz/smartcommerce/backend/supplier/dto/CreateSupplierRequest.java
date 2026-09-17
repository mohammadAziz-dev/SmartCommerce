package dev.mohammadaziz.smartcommerce.backend.supplier.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateSupplierRequest(

        @NotBlank(message = "Supplier name is required")
        String name,

        @Email(message = "Email must be valid")
        String email,

        String phone,
        String country,
        String preferredCurrency
) {
}
