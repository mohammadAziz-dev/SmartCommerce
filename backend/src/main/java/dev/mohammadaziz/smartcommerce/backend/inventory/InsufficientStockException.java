package dev.mohammadaziz.smartcommerce.backend.inventory;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException() {
        super("Insufficient stock");
    }
}