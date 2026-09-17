package dev.mohammadaziz.smartcommerce.backend.inventory;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.UUID;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class InventoryNotFoundException extends RuntimeException {

    public InventoryNotFoundException(UUID productId) {
        super("Inventory not found for product: " + productId);
    }
}