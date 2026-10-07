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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

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

}