package dev.mohammadaziz.smartcommerce.backend.inventory;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.UUID;

@ResponseStatus(HttpStatus.CONFLICT)
public class InventoryAlreadyExistsException extends RuntimeException {

    public InventoryAlreadyExistsException(UUID productId) {
        super("Inventory already exists for product: " + productId);
    }
}