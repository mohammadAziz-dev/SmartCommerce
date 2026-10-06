package dev.mohammadaziz.smartcommerce.backend.email;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderItemResponse;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ResendEmailService implements EmailService {

    private final Resend resend;

    @Autowired
    public ResendEmailService(
            @Value("${resend.api-key}") String apiKey
    ) {
        this(new Resend(apiKey));
    }

    ResendEmailService(Resend resend) {
        this.resend = resend;
    }

    @Override
    public void sendEmailVerification(
            String recipientEmail,
            String recipientName,
            String verificationUrl
    ) {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("SmartCommerce <noreply@mohammadaziz.dev>")
                .to(recipientEmail)
                .subject("Verify your SmartCommerce email")
                .html("""
                        <p>Hello %s,</p>
                        <p>Please verify your email address:</p>
                        <p><a href="%s">Verify email</a></p>
                        <p>This link expires in 1 hour.</p>
                        """.formatted(recipientName, verificationUrl))
                .build();

        try {
            resend.emails().send(params);
        } catch (ResendException exception) {
            throw new EmailSendingException("Failed to send verification email.", exception);
        }
    }

    @Override
    public void sendOrderConfirmation(
            String recipientEmail,
            String recipientName,
            OrderResponse order
    ) {
        StringBuilder itemsHtml = new StringBuilder();

        for (OrderItemResponse item : order.items()) {
            itemsHtml.append("<li>")
                    .append(item.productName())
                    .append(" — quantity: ").append(item.quantity())
                    .append(" — unit price: €").append(item.unitPrice())
                    .append(" — subtotal: €").append(item.subtotal())
                    .append("</li>");
        }

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("SmartCommerce <noreply@mohammadaziz.dev>")
                .to(recipientEmail)
                .subject("Your SmartCommerce order confirmation")
                .html("""
                        <p>Hello %s,</p>
                        <p>Thank you for your order.</p>
                        <p><strong>Order ID:</strong> %s</p>
                        <h3>Products</h3>
                        <ul>%s</ul>
                        <p><strong>Total: €%s</strong></p>
                        """.formatted(
                        recipientName,
                        order.id(),
                        itemsHtml,
                        order.totalPrice()
                ))
                .build();

        try {
            resend.emails().send(params);
        } catch (ResendException exception) {
            throw new EmailSendingException("Failed to send order confirmation email.", exception);
        }
    }
}
