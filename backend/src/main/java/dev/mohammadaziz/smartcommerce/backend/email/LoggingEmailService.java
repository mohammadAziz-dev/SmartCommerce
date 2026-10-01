package dev.mohammadaziz.smartcommerce.backend.email;

import org.springframework.stereotype.Service;

@Service
public class LoggingEmailService implements EmailService {

    @Override
    public void sendEmailVerification(
            String recipientEmail,
            String recipientName,
            String verificationUrl
    ) {
        // Temporary implementation.
        // Real transactional email provider will replace this later.
    }
}