package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.email.EmailService;
import dev.mohammadaziz.smartcommerce.backend.inventory.Inventory;
import dev.mohammadaziz.smartcommerce.backend.inventory.InventoryRepository;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderItemRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;
import dev.mohammadaziz.smartcommerce.backend.user.User;
import dev.mohammadaziz.smartcommerce.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@SpringBootTest
@ActiveProfiles("test")
class OrderServiceIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private EmailService emailService;

    @Test
    void contextLoads() {
    }

    @Test
    void shouldPlaceOrderAndDeductInventory() {
        User user = userRepository.save(new User(
                UUID.randomUUID(),
                "Integration Customer",
                "integration.customer@example.com",
                "hashed-password",
                true,
                Instant.now()
        ));

        Business business = businessRepository.save(
                new Business("Integration Test Business")
        );

        Product mouse = productRepository.save(
                new Product(
                        business,
                        "Wireless Mouse",
                        "Test mouse",
                        null,
                        "TEST-MOUSE-001",
                        new BigDecimal("29.99"),
                        "Electronics",
                        true
                )
        );

        Product keyboard = productRepository.save(
                new Product(
                        business,
                        "Keyboard",
                        "Test keyboard",
                        null,
                        "TEST-KEYBOARD-001",
                        new BigDecimal("49.99"),
                        "Electronics",
                        true
                )
        );

        inventoryRepository.save(
                new Inventory(business, mouse, 10, 5)
        );

        inventoryRepository.save(
                new Inventory(business, keyboard, 1, 5)
        );

        CreateOrderRequest request = new CreateOrderRequest(
                List.of(
                        new CreateOrderItemRequest(mouse.getId(), 2),
                        new CreateOrderItemRequest(keyboard.getId(), 1)
                )
        );

        OrderResponse response = orderService.placeOrder(
                business.getId(),
                request,
                user.getEmail()
        );

        Inventory mouseInventory = inventoryRepository
                .findByBusinessIdAndProductId(business.getId(), mouse.getId())
                .orElseThrow();

        Inventory keyboardInventory = inventoryRepository
                .findByBusinessIdAndProductId(business.getId(), keyboard.getId())
                .orElseThrow();

        assertEquals(8, mouseInventory.getQuantity());
        assertEquals(0, keyboardInventory.getQuantity());

        assertEquals(new BigDecimal("109.97"), response.totalPrice());
        assertEquals(2, response.items().size());

        assertEquals(1, orderRepository.count());

        verify(emailService).sendOrderConfirmation(
                user.getEmail(),
                user.getName(),
                response
        );
    }

    @Test
    void shouldNotSendConfirmationEmailWhenOrderPlacementFails() {
        User user = userRepository.save(new User(
                UUID.randomUUID(),
                "Failed Order Customer",
                "failed.order@example.com",
                "hashed-password",
                true,
                Instant.now()
        ));

        Business business = businessRepository.save(
                new Business("Failed Order Business")
        );

        Product product = productRepository.save(
                new Product(
                        business,
                        "Low Stock Product",
                        "Test product",
                        null,
                        "LOW-STOCK-001",
                        new BigDecimal("19.99"),
                        "Test",
                        true
                )
        );

        inventoryRepository.save(
                new Inventory(business, product, 1, 5)
        );

        CreateOrderRequest request = new CreateOrderRequest(
                List.of(
                        new CreateOrderItemRequest(product.getId(), 2)
                )
        );

        assertThrows(
                RuntimeException.class,
                () -> orderService.placeOrder(
                        business.getId(),
                        request,
                        user.getEmail()
                )
        );

        verify(emailService, never()).sendOrderConfirmation(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(OrderResponse.class)
        );
    }
}

