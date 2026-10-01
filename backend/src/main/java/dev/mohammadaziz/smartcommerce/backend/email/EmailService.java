package dev.mohammadaziz.smartcommerce.backend.email;

public interface EmailService {

    void sendEmailVerification(
            String recipientEmail,
            String recipientName,
            String verificationUrl
    );
}