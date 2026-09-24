package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.inventory.Inventory;
import dev.mohammadaziz.smartcommerce.backend.inventory.InventoryRepository;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderItemRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

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

    @Test
    void contextLoads() {
    }

    @Test
    void shouldPlaceOrderAndDeductInventory() {
        Business business = businessRepository.save(
                new Business("Integration Test Business")
        );

        Product mouse = productRepository.save(
                new Product(
                        business,
                        "Wireless Mouse",
                        "Test mouse",
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
                request
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
    }
}
