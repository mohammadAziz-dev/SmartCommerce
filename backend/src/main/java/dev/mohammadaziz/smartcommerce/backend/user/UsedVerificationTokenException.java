package dev.mohammadaziz.smartcommerce.backend.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class UsedVerificationTokenException extends RuntimeException {

    public UsedVerificationTokenException() {
        super("Verification token has already been used.");
    }
}