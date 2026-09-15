package dev.mohammadaziz.smartcommerce.backend.business;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.UUID;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class BusinessNotFoundException extends RuntimeException {

    public BusinessNotFoundException(UUID id) {
        super("Business not found with id: " + id);
    }
}