package dev.mohammadaziz.smartcommerce.backend.payment;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CreatePaymentRequest;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CreatePaymentResponse;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
public class PaymentService {

    private final ProductRepository productRepository;
    private final String stripeSecretKey;

    public PaymentService(
            ProductRepository productRepository,
            @Value("${stripe.secret-key}") String stripeSecretKey
    ) {
        this.productRepository = productRepository;
        this.stripeSecretKey = stripeSecretKey;
    }

    public CreatePaymentResponse createPayment(
            UUID businessId,
            CreatePaymentRequest request
    ) throws StripeException {
        BigDecimal amount = calculateAmount(businessId, request);

        long amountInCents = amount
                .movePointRight(2)
                .setScale(0, RoundingMode.UNNECESSARY)
                .longValueExact();

        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(amountInCents)
                        .setCurrency("eur")
                        .putMetadata("businessId", businessId.toString())
                        .build();

        RequestOptions requestOptions = RequestOptions.builder()
                .setApiKey(stripeSecretKey)
                .build();

        PaymentIntent paymentIntent =
                PaymentIntent.create(params, requestOptions);

        return new CreatePaymentResponse(
                paymentIntent.getClientSecret()
        );
    }

    public boolean isPaymentSuccessful(
            String paymentIntentId,
            UUID businessId,
            BigDecimal expectedAmount
    ) throws StripeException {

        RequestOptions requestOptions = RequestOptions.builder()
                .setApiKey(stripeSecretKey)
                .build();

        PaymentIntent paymentIntent =
                PaymentIntent.retrieve(paymentIntentId, requestOptions);

        long expectedAmountInCents = expectedAmount
                .movePointRight(2)
                .setScale(0, RoundingMode.UNNECESSARY)
                .longValueExact();

        return "succeeded".equals(paymentIntent.getStatus())
                && expectedAmountInCents == paymentIntent.getAmount()
                && "eur".equals(paymentIntent.getCurrency())
                && businessId.toString().equals(
                paymentIntent.getMetadata().get("businessId")
        );
    }

    public BigDecimal calculateAmount(
            UUID businessId,
            CreatePaymentRequest request
    ) {
        BigDecimal total = BigDecimal.ZERO;

        for (var item : request.items()) {
            Product product = productRepository
                    .findByIdAndBusinessId(item.productId(), businessId)
                    .orElseThrow(() ->
                            new ProductNotFoundException(item.productId())
                    );

            BigDecimal subtotal = product.getSellingPrice()
                    .multiply(BigDecimal.valueOf(item.quantity()));

            total = total.add(subtotal);
        }

        return total;
    }
}