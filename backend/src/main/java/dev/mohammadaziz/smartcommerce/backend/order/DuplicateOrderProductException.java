package dev.mohammadaziz.smartcommerce.backend.order;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DuplicateOrderProductException extends RuntimeException {

    public DuplicateOrderProductException() {
        super("Duplicate product in order");
    }
}
