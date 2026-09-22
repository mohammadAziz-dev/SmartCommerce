package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class OrderTest {

    private Business business;
    private Product product;
    private Order order;

    @BeforeEach
    void setUp() {
        business = new Business("Mohammad Electronics");

        product = new Product(
                business,
                "Wireless Mouse",
                "Wireless ergonomic mouse",
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                true
        );

        order = new Order(business);
    }

    @Test
    void shouldCreateOrderWithDefaultValues() {
        assertEquals(business, order.getBusiness());
        assertEquals(OrderStatus.CREATED, order.getStatus());
        assertNotNull(order.getCreatedAt());
        assertTrue(order.getItems().isEmpty());
    }

    @Test
    void shouldAddItemToOrder() {
        order.addItem(
                product,
                2,
                new BigDecimal("29.99")
        );

        assertEquals(1, order.getItems().size());

        OrderItem item = order.getItems().getFirst();

        assertEquals(order, item.getOrder());
        assertEquals(product, item.getProduct());
        assertEquals(2, item.getQuantity());
        assertEquals(new BigDecimal("29.99"), item.getUnitPrice());
    }

    @Test
    void shouldRejectZeroQuantity() {
        BigDecimal unitPrice = new BigDecimal("29.99");

        assertThrows(
                IllegalArgumentException.class,
                () -> order.addItem(product, 0, unitPrice)
        );
    }

    @Test
    void shouldRejectNegativeQuantity() {
        BigDecimal unitPrice = new BigDecimal("29.99");

        assertThrows(
                IllegalArgumentException.class,
                () -> order.addItem(product, -1, unitPrice)
        );
    }

    @Test
    void shouldRejectNegativeUnitPrice() {
        BigDecimal negativeUnitPrice = new BigDecimal("-1.00");

        assertThrows(
                IllegalArgumentException.class,
                () -> order.addItem(product, 1, negativeUnitPrice)
        );
    }
}