package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.email.EmailSendingException;
import dev.mohammadaziz.smartcommerce.backend.email.EmailService;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderPlacedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class OrderConfirmationEmailListener {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(OrderConfirmationEmailListener.class);

    private final EmailService emailService;

    public OrderConfirmationEmailListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderPlaced(OrderPlacedEvent event) {
        try {
            emailService.sendOrderConfirmation(
                    event.customerEmail(),
                    event.customerName(),
                    event.order()
            );
        } catch (EmailSendingException exception) {
            LOGGER.error(
                    "Order {} was created, but the confirmation email could not be sent.",
                    event.order().id(),
                    exception
            );
        }
    }
}
