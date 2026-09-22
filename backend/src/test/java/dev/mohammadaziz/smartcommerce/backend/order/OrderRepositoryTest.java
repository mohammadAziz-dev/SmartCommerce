package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void shouldPersistOrderWithItems() {
        Business business =
                businessRepository.save(new Business("Mohammad Electronics"));

        Product product = productRepository.save(
                new Product(
                        business,
                        "Wireless Mouse",
                        "Wireless ergonomic mouse",
                        "MOUSE-001",
                        new BigDecimal("29.99"),
                        "Electronics",
                        true
                )
        );

        Order order = new Order(business);

        order.addItem(
                product,
                2,
                new BigDecimal("29.99")
        );

        Order savedOrder = orderRepository.save(order);

        assertNotNull(savedOrder.getId());
        assertEquals(OrderStatus.CREATED, savedOrder.getStatus());
        assertEquals(1, savedOrder.getItems().size());

        OrderItem savedItem = savedOrder.getItems().getFirst();

        assertNotNull(savedItem.getId());
        assertEquals(product.getId(), savedItem.getProduct().getId());
        assertEquals(2, savedItem.getQuantity());
        assertEquals(
                new BigDecimal("29.99"),
                savedItem.getUnitPrice()
        );
    }

    @Test
    void shouldReturnOnlyOrdersForRequestedBusiness() {
        Business businessA =
                businessRepository.save(new Business("Mohammad Electronics"));

        Business businessB =
                businessRepository.save(new Business("Other Business"));

        Order orderA = orderRepository.save(new Order(businessA));
        orderRepository.save(new Order(businessB));

        List<Order> orders =
                orderRepository.findAllByBusinessId(businessA.getId());

        assertEquals(1, orders.size());
        assertEquals(orderA.getId(), orders.getFirst().getId());
        assertEquals(
                businessA.getId(),
                orders.getFirst().getBusiness().getId()
        );
    }

    @Test
    void shouldNotReturnOrderForDifferentBusiness() {
        Business businessA =
                businessRepository.save(new Business("Mohammad Electronics"));

        Business businessB =
                businessRepository.save(new Business("Other Business"));

        Order order =
                orderRepository.save(new Order(businessA));

        var result = orderRepository.findByIdAndBusinessId(
                order.getId(),
                businessB.getId()
        );

        assertTrue(result.isEmpty());
    }
}