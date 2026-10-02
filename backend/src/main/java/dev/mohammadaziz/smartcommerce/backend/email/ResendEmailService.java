package dev.mohammadaziz.smartcommerce.backend.email;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.core.exception.ResendException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ResendEmailService implements EmailService {

    private final Resend resend;

    public ResendEmailService(
            @Value("${resend.api-key}") String apiKey
    ) {
        this.resend = new Resend(apiKey);
    }

    @Override
    public void sendEmailVerification(
            String recipientEmail,
            String recipientName,
            String verificationUrl
    ) {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("SmartCommerce <onboarding@resend.dev>")
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
}