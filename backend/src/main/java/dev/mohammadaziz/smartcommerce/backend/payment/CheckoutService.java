package dev.mohammadaziz.smartcommerce.backend.payment;

import com.stripe.exception.StripeException;
import dev.mohammadaziz.smartcommerce.backend.order.OrderService;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderItemRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CompleteCheckoutRequest;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CreatePaymentRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class CheckoutService {

    private final PaymentService paymentService;
    private final OrderService orderService;

    public CheckoutService(
            PaymentService paymentService,
            OrderService orderService
    ) {
        this.paymentService = paymentService;
        this.orderService = orderService;
    }

    public OrderResponse completeCheckout(
            UUID businessId,
            CompleteCheckoutRequest request,
            String customerEmail
    ) throws StripeException {

        CreatePaymentRequest paymentRequest = new CreatePaymentRequest(
                request.items()
        );

        BigDecimal expectedAmount =
                paymentService.calculateAmount(businessId, paymentRequest);

        boolean paymentSuccessful = paymentService.isPaymentSuccessful(
                request.paymentIntentId(),
                businessId,
                expectedAmount
        );

        if (!paymentSuccessful) {
            throw new PaymentVerificationException();
        }

        CreateOrderRequest orderRequest = new CreateOrderRequest(
                request.items().stream()
                        .map(item -> new CreateOrderItemRequest(
                                item.productId(),
                                item.quantity()
                        ))
                        .toList()
        );

        return orderService.placeOrder(
                businessId,
                orderRequest,
                customerEmail
        );
    }
}