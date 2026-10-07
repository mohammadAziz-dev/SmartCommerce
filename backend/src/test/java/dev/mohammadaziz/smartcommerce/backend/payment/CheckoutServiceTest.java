package dev.mohammadaziz.smartcommerce.backend.payment;

import dev.mohammadaziz.smartcommerce.backend.payment.dto.CompleteCheckoutRequest;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CreatePaymentRequest;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.PaymentItemRequest;
import dev.mohammadaziz.smartcommerce.backend.order.OrderStatus;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

import dev.mohammadaziz.smartcommerce.backend.order.OrderService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private OrderService orderService;

    private CheckoutService checkoutService;

    @BeforeEach
    void setUp() {
        checkoutService = new CheckoutService(
                paymentService,
                orderService
        );
    }

    @Test
    void shouldNotPlaceOrderWhenPaymentVerificationFails() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        CompleteCheckoutRequest request = new CompleteCheckoutRequest(
                "pi_test_failed",
                List.of(new PaymentItemRequest(productId, 1))
        );

        when(paymentService.calculateAmount(
                any(UUID.class),
                any(CreatePaymentRequest.class)
        )).thenReturn(new BigDecimal("39.99"));

        when(paymentService.isPaymentSuccessful(
                "pi_test_failed",
                businessId,
                new BigDecimal("39.99")
        )).thenReturn(false);

        assertThrows(
                PaymentVerificationException.class,
                () -> checkoutService.completeCheckout(
                        businessId,
                        request,
                        "customer@example.com"
                )
        );

        verify(orderService, never()).placeOrder(
                any(),
                any(),
                anyString()
        );
    }

    @Test
    void shouldPlaceOrderWhenPaymentVerificationSucceeds() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        CompleteCheckoutRequest request = new CompleteCheckoutRequest(
                "pi_test_success",
                List.of(new PaymentItemRequest(productId, 1))
        );

        when(paymentService.calculateAmount(
                any(UUID.class),
                any(CreatePaymentRequest.class)
        )).thenReturn(new BigDecimal("39.99"));

        when(paymentService.isPaymentSuccessful(
                "pi_test_success",
                businessId,
                new BigDecimal("39.99")
        )).thenReturn(true);

        OrderResponse expectedOrder = new OrderResponse(
                UUID.randomUUID(),
                businessId,
                OrderStatus.CREATED,
                new BigDecimal("39.99"),
                Instant.now(),
                List.of()
        );

        when(orderService.placeOrder(
                any(UUID.class),
                any(),
                anyString()
        )).thenReturn(expectedOrder);

        OrderResponse result = checkoutService.completeCheckout(
                businessId,
                request,
                "customer@example.com"
        );

        assertEquals(expectedOrder, result);

        verify(orderService).placeOrder(
                any(UUID.class),
                any(),
                anyString()
        );
    }
}