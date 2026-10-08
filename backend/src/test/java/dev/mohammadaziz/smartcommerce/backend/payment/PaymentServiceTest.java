package dev.mohammadaziz.smartcommerce.backend.payment;

import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;
import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.CreatePaymentRequest;
import dev.mohammadaziz.smartcommerce.backend.payment.dto.PaymentItemRequest;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductNotFoundException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockedStatic;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private ProductRepository productRepository;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                productRepository,
                "sk_test_fake"
        );
    }

    @Test
    void shouldCalculatePaymentAmountFromProductPrices() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = new Business("SmartOffice Store");

        Product product = new Product(
                business,
                "Gaming Mouse",
                "Wireless gaming mouse",
                null,
                "MOUSE-001",
                new BigDecimal("39.99"),
                "Gaming",
                true
        );

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(product));

        CreatePaymentRequest request = new CreatePaymentRequest(
                List.of(new PaymentItemRequest(productId, 2))
        );

        BigDecimal amount = paymentService.calculateAmount(
                businessId,
                request
        );

        assertEquals(new BigDecimal("79.98"), amount);
    }

    @Test
    void shouldRejectPaymentWhenProductDoesNotExist() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.empty());

        CreatePaymentRequest request = new CreatePaymentRequest(
                List.of(new PaymentItemRequest(productId, 1))
        );

        assertThrows(
                ProductNotFoundException.class,
                () -> paymentService.calculateAmount(businessId, request)
        );
    }

    @Test
    void shouldCreatePaymentIntent() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = new Business("SmartOffice Store");

        Product product = new Product(
                business,
                "Gaming Mouse",
                "Wireless gaming mouse",
                null,
                "MOUSE-001",
                new BigDecimal("39.99"),
                "Gaming",
                true
        );

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(product));

        CreatePaymentRequest request = new CreatePaymentRequest(
                List.of(new PaymentItemRequest(productId, 2))
        );

        PaymentIntent paymentIntent = mock(PaymentIntent.class);
        when(paymentIntent.getClientSecret())
                .thenReturn("pi_secret_test");

        try (MockedStatic<PaymentIntent> mockedPaymentIntent =
                     mockStatic(PaymentIntent.class)) {

            mockedPaymentIntent
                    .when(() -> PaymentIntent.create(
                            any(PaymentIntentCreateParams.class),
                            any(RequestOptions.class)
                    ))
                    .thenReturn(paymentIntent);

            var response = paymentService.createPayment(
                    businessId,
                    request
            );

            assertEquals("pi_secret_test", response.clientSecret());
        }
    }

    @Test
    void shouldVerifySuccessfulPayment() throws Exception {
        UUID businessId = UUID.randomUUID();

        PaymentIntent paymentIntent = mock(PaymentIntent.class);

        when(paymentIntent.getStatus()).thenReturn("succeeded");
        when(paymentIntent.getAmount()).thenReturn(7998L);
        when(paymentIntent.getCurrency()).thenReturn("eur");
        when(paymentIntent.getMetadata())
                .thenReturn(Map.of("businessId", businessId.toString()));

        try (MockedStatic<PaymentIntent> mockedPaymentIntent =
                     mockStatic(PaymentIntent.class)) {

            mockedPaymentIntent
                    .when(() -> PaymentIntent.retrieve(
                            any(String.class),
                            any(RequestOptions.class)
                    ))
                    .thenReturn(paymentIntent);

            boolean result = paymentService.isPaymentSuccessful(
                    "pi_test_success",
                    businessId,
                    new BigDecimal("79.98")
            );

            assertTrue(result);
        }
    }

    @Test
    void shouldRejectPaymentWhenAmountDoesNotMatch() throws Exception {
        UUID businessId = UUID.randomUUID();

        PaymentIntent paymentIntent = mock(PaymentIntent.class);

        when(paymentIntent.getStatus()).thenReturn("succeeded");
        when(paymentIntent.getAmount()).thenReturn(5000L);

        try (MockedStatic<PaymentIntent> mockedPaymentIntent =
                     mockStatic(PaymentIntent.class)) {

            mockedPaymentIntent
                    .when(() -> PaymentIntent.retrieve(
                            any(String.class),
                            any(RequestOptions.class)
                    ))
                    .thenReturn(paymentIntent);

            boolean result = paymentService.isPaymentSuccessful(
                    "pi_test_wrong_amount",
                    businessId,
                    new BigDecimal("79.98")
            );

            assertFalse(result);
        }
    }

    @Test
    void shouldRejectPaymentWhenStatusIsNotSucceeded() throws Exception {
        UUID businessId = UUID.randomUUID();

        PaymentIntent paymentIntent = mock(PaymentIntent.class);
        when(paymentIntent.getStatus()).thenReturn("requires_payment_method");

        try (MockedStatic<PaymentIntent> mockedPaymentIntent =
                     mockStatic(PaymentIntent.class)) {

            mockedPaymentIntent
                    .when(() -> PaymentIntent.retrieve(
                            any(String.class),
                            any(RequestOptions.class)
                    ))
                    .thenReturn(paymentIntent);

            boolean result = paymentService.isPaymentSuccessful(
                    "pi_test_failed",
                    businessId,
                    new BigDecimal("79.98")
            );

            assertFalse(result);
        }
    }

    @Test
    void shouldRejectPaymentWhenCurrencyDoesNotMatch() throws Exception {
        UUID businessId = UUID.randomUUID();

        PaymentIntent paymentIntent = mock(PaymentIntent.class);

        when(paymentIntent.getStatus()).thenReturn("succeeded");
        when(paymentIntent.getAmount()).thenReturn(7998L);
        when(paymentIntent.getCurrency()).thenReturn("usd");

        try (MockedStatic<PaymentIntent> mockedPaymentIntent =
                     mockStatic(PaymentIntent.class)) {

            mockedPaymentIntent
                    .when(() -> PaymentIntent.retrieve(
                            any(String.class),
                            any(RequestOptions.class)
                    ))
                    .thenReturn(paymentIntent);

            boolean result = paymentService.isPaymentSuccessful(
                    "pi_test_wrong_currency",
                    businessId,
                    new BigDecimal("79.98")
            );

            assertFalse(result);
        }
    }

    @Test
    void shouldRejectPaymentWhenBusinessDoesNotMatch() throws Exception {
        UUID businessId = UUID.randomUUID();

        PaymentIntent paymentIntent = mock(PaymentIntent.class);

        when(paymentIntent.getStatus()).thenReturn("succeeded");
        when(paymentIntent.getAmount()).thenReturn(7998L);
        when(paymentIntent.getCurrency()).thenReturn("eur");
        when(paymentIntent.getMetadata())
                .thenReturn(Map.of(
                        "businessId",
                        UUID.randomUUID().toString()
                ));

        try (MockedStatic<PaymentIntent> mockedPaymentIntent =
                     mockStatic(PaymentIntent.class)) {

            mockedPaymentIntent
                    .when(() -> PaymentIntent.retrieve(
                            any(String.class),
                            any(RequestOptions.class)
                    ))
                    .thenReturn(paymentIntent);

            boolean result = paymentService.isPaymentSuccessful(
                    "pi_test_wrong_business",
                    businessId,
                    new BigDecimal("79.98")
            );

            assertFalse(result);
        }
    }

}