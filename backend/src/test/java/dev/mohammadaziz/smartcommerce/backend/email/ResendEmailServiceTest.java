package dev.mohammadaziz.smartcommerce.backend.email;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.Emails;
import dev.mohammadaziz.smartcommerce.backend.order.OrderStatus;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderItemResponse;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ResendEmailServiceTest {

    private Resend resend;
    private Emails emails;
    private ResendEmailService emailService;

    @BeforeEach
    void setUp() {
        resend = mock(Resend.class);
        emails = mock(Emails.class);

        when(resend.emails()).thenReturn(emails);

        emailService = new ResendEmailService(resend);
    }

    @Test
    void shouldSendOrderConfirmationEmail() throws ResendException {
        OrderResponse order = createOrderResponse();

        emailService.sendOrderConfirmation(
                "customer@example.com",
                "Customer",
                order
        );

        verify(emails).send(any());
    }

    @Test
    void shouldThrowEmailSendingExceptionWhenOrderConfirmationFails()
            throws ResendException {
        OrderResponse order = createOrderResponse();

        when(emails.send(any()))
                .thenThrow(new ResendException("Resend failed"));

        assertThrows(
                EmailSendingException.class,
                () -> emailService.sendOrderConfirmation(
                        "customer@example.com",
                        "Customer",
                        order
                )
        );
    }

    private OrderResponse createOrderResponse() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        OrderItemResponse item = new OrderItemResponse(
                productId,
                "Office Keyboard",
                2,
                new BigDecimal("59.99"),
                new BigDecimal("119.98")
        );

        return new OrderResponse(
                UUID.randomUUID(),
                businessId,
                OrderStatus.CREATED,
                new BigDecimal("119.98"),
                Instant.now(),
                List.of(item)
        );
    }
}
