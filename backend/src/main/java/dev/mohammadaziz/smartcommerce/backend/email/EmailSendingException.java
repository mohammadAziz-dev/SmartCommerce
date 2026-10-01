package dev.mohammadaziz.smartcommerce.backend.email;

public class EmailSendingException extends RuntimeException {

    public EmailSendingException(String message, Throwable cause) {
        super(message, cause);
    }
}