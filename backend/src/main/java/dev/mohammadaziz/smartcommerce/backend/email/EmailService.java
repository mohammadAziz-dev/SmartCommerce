package dev.mohammadaziz.smartcommerce.backend.email;

import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;

public interface EmailService {

    void sendEmailVerification(
            String recipientEmail,
            String recipientName,
            String verificationUrl
    );

    void sendOrderConfirmation(
            String recipientEmail,
            String recipientName,
            OrderResponse order
    );
}
