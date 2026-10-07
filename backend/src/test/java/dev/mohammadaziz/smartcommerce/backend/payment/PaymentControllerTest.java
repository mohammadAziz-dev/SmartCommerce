package dev.mohammadaziz.smartcommerce.backend.payment;

import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CompleteCheckoutRequest;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CreatePaymentRequest;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CreatePaymentResponse;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.PaymentItemRequest;
import dev.mohammadaziz.smartcommerce.backend.order.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private CheckoutService checkoutService;

    @Mock
    private Authentication authentication;

    private PaymentController paymentController;

    @BeforeEach
    void setUp() {
        paymentController = new PaymentController(
                paymentService,
                checkoutService
        );
    }

    @Test
    void shouldCreatePayment() throws Exception {
        UUID businessId = UUID.randomUUID();

        CreatePaymentRequest request = new CreatePaymentRequest(
                List.of(new PaymentItemRequest(UUID.randomUUID(), 1))
        );

        CreatePaymentResponse expected =
                new CreatePaymentResponse("client_secret_test");

        when(paymentService.createPayment(businessId, request))
                .thenReturn(expected);

        CreatePaymentResponse result =
                paymentController.createPayment(businessId, request);

        assertEquals(expected, result);
    }

    @Test
    void shouldCompleteCheckout() throws Exception {
        UUID businessId = UUID.randomUUID();

        CompleteCheckoutRequest request = new CompleteCheckoutRequest(
                "pi_test_success",
                List.of(new PaymentItemRequest(UUID.randomUUID(), 1))
        );

        OrderResponse expected = new OrderResponse(
                UUID.randomUUID(),
                businessId,
                OrderStatus.CREATED,
                new BigDecimal("39.99"),
                Instant.now(),
                List.of()
        );

        when(authentication.getName())
                .thenReturn("customer@example.com");

        when(checkoutService.completeCheckout(
                businessId,
                request,
                "customer@example.com"
        )).thenReturn(expected);

        OrderResponse result = paymentController.completeCheckout(
                businessId,
                request,
                authentication
        );

        assertEquals(expected, result);
    }
}