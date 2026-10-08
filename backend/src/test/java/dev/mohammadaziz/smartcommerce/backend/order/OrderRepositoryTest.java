package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;
import dev.mohammadaziz.smartcommerce.backend.user.User;
import dev.mohammadaziz.smartcommerce.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    private User createUser(String email) {
        return userRepository.save(new User(
                UUID.randomUUID(),
                "Test Customer",
                email,
                "hashed-password",
                true,
                Instant.now()
        ));
    }

    @Test
    void shouldPersistOrderWithItems() {
        Business business =
                businessRepository.save(new Business("Mohammad Electronics"));

        Product product = productRepository.save(
                new Product(
                        business,
                        "Wireless Mouse",
                        "Wireless ergonomic mouse",
                        null,
                        "MOUSE-001",
                        new BigDecimal("29.99"),
                        "Electronics",
                        true
                )
        );

        User user = createUser("repository-customer-1@example.com");

        Order order = new Order(business, user);

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

        User user = createUser("repository-customer-2@example.com");

        Order orderA = orderRepository.save(new Order(businessA, user));
        orderRepository.save(new Order(businessB, user));

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

        User user = createUser("repository-customer-3@example.com");

        Order order =
                orderRepository.save(new Order(businessA, user));

        var result = orderRepository.findByIdAndBusinessId(
                order.getId(),
                businessB.getId()
        );

        assertTrue(result.isEmpty());
    }
}