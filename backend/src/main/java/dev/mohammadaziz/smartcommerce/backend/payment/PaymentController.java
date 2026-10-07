package dev.mohammadaziz.smartcommerce.backend.payment;

import com.stripe.exception.StripeException;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CreatePaymentRequest;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CreatePaymentResponse;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CompleteCheckoutRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final CheckoutService checkoutService;

    public PaymentController(
            PaymentService paymentService,
            CheckoutService checkoutService
    ) {
        this.paymentService = paymentService;
        this.checkoutService = checkoutService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreatePaymentResponse createPayment(
            @PathVariable UUID businessId,
            @Valid @RequestBody CreatePaymentRequest request
    ) throws StripeException {
        return paymentService.createPayment(businessId, request);
    }

    @PostMapping("/complete")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse completeCheckout(
            @PathVariable UUID businessId,
            @Valid @RequestBody CompleteCheckoutRequest request,
            Authentication authentication
    ) throws StripeException {
        return checkoutService.completeCheckout(
                businessId,
                request,
                authentication.getName()
        );
    }
}