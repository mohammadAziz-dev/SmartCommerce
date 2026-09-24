package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.inventory.InsufficientStockException;
import dev.mohammadaziz.smartcommerce.backend.inventory.InventoryNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.inventory.InventoryService;
import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryResponse;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderItemRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderItemResponse;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryService inventoryService;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                orderRepository,
                businessRepository,
                productRepository,
                inventoryService
        );
    }

    @Test
    void shouldPlaceOrderSuccessfully() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = mock(Business.class);

        when(business.getId()).thenReturn(businessId);

        Product product = mock(Product.class);

        when(product.getId()).thenReturn(productId);
        when(product.getName()).thenReturn("Wireless Mouse");
        when(product.getSellingPrice()).thenReturn(new BigDecimal("29.99"));

        CreateOrderRequest request = new CreateOrderRequest(
                List.of(new CreateOrderItemRequest(productId, 2))
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(product));

        InventoryResponse inventoryResponse = new InventoryResponse(
                UUID.randomUUID(),
                businessId,
                productId,
                10,
                5,
                false
        );

        when(inventoryService.getInventoryResponse(businessId, productId))
                .thenReturn(inventoryResponse);

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.placeOrder(businessId, request);

        assertNotNull(response);
        assertEquals(businessId, response.businessId());
        assertEquals(OrderStatus.CREATED, response.status());
        assertEquals(new BigDecimal("59.98"), response.totalPrice());

        assertEquals(1, response.items().size());

        OrderItemResponse item = response.items().getFirst();

        assertEquals(productId, item.productId());
        assertEquals("Wireless Mouse", item.productName());
        assertEquals(2, item.quantity());
        assertEquals(new BigDecimal("29.99"), item.unitPrice());
        assertEquals(new BigDecimal("59.98"), item.subtotal());

        verify(inventoryService).decreaseStock(
                businessId,
                productId,
                2
        );
    }

    @Test
    void shouldThrowWhenBusinessDoesNotExist() {
        UUID businessId = UUID.randomUUID();

        CreateOrderRequest request = new CreateOrderRequest(
                List.of(new CreateOrderItemRequest(UUID.randomUUID(), 1))
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessNotFoundException.class,
                () -> orderService.placeOrder(businessId, request)
        );
    }

    @Test
    void shouldThrowWhenProductDoesNotExistForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = mock(Business.class);

        CreateOrderRequest request = new CreateOrderRequest(
                List.of(new CreateOrderItemRequest(productId, 1))
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.empty());

        assertThrows(
                ProductNotFoundException.class,
                () -> orderService.placeOrder(businessId, request)
        );
    }

    @Test
    void shouldThrowWhenInventoryDoesNotExist() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = mock(Business.class);
        Product product = mock(Product.class);

        when(product.getId()).thenReturn(productId);

        CreateOrderRequest request = new CreateOrderRequest(
                List.of(new CreateOrderItemRequest(productId, 1))
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(product));

        when(inventoryService.getInventoryResponse(businessId, productId))
                .thenThrow(new InventoryNotFoundException(productId));

        assertThrows(
                InventoryNotFoundException.class,
                () -> orderService.placeOrder(businessId, request)
        );
    }

    @Test
    void shouldThrowWhenStockIsInsufficient() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = mock(Business.class);
        Product product = mock(Product.class);

        when(product.getId()).thenReturn(productId);

        CreateOrderRequest request = new CreateOrderRequest(
                List.of(new CreateOrderItemRequest(productId, 5))
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(product));

        InventoryResponse inventoryResponse = new InventoryResponse(
                UUID.randomUUID(),
                businessId,
                productId,
                2,
                5,
                true
        );

        when(inventoryService.getInventoryResponse(businessId, productId))
                .thenReturn(inventoryResponse);

        assertThrows(
                InsufficientStockException.class,
                () -> orderService.placeOrder(businessId, request)
        );
    }

    @Test
    void shouldThrowWhenOrderContainsDuplicateProduct() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = mock(Business.class);
        Product product = mock(Product.class);

        when(product.getId()).thenReturn(productId);

        CreateOrderRequest request = new CreateOrderRequest(
                List.of(
                        new CreateOrderItemRequest(productId, 1),
                        new CreateOrderItemRequest(productId, 2)
                )
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(product));

        InventoryResponse inventoryResponse = new InventoryResponse(
                UUID.randomUUID(),
                businessId,
                productId,
                10,
                5,
                false
        );

        when(inventoryService.getInventoryResponse(businessId, productId))
                .thenReturn(inventoryResponse);

        assertThrows(
                DuplicateOrderProductException.class,
                () -> orderService.placeOrder(businessId, request)
        );
    }

    @Test
    void shouldNotDeductStockWhenOneOrderItemHasInsufficientStock() {
        UUID businessId = UUID.randomUUID();
        UUID firstProductId = UUID.randomUUID();
        UUID secondProductId = UUID.randomUUID();

        Business business = mock(Business.class);
        Product firstProduct = mock(Product.class);
        Product secondProduct = mock(Product.class);

        when(firstProduct.getId()).thenReturn(firstProductId);
        when(secondProduct.getId()).thenReturn(secondProductId);

        CreateOrderRequest request = new CreateOrderRequest(
                List.of(
                        new CreateOrderItemRequest(firstProductId, 2),
                        new CreateOrderItemRequest(secondProductId, 5)
                )
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        when(productRepository.findByIdAndBusinessId(firstProductId, businessId))
                .thenReturn(Optional.of(firstProduct));

        when(productRepository.findByIdAndBusinessId(secondProductId, businessId))
                .thenReturn(Optional.of(secondProduct));

        when(inventoryService.getInventoryResponse(businessId, firstProductId))
                .thenReturn(new InventoryResponse(
                        UUID.randomUUID(),
                        businessId,
                        firstProductId,
                        10,
                        5,
                        false
                ));

        when(inventoryService.getInventoryResponse(businessId, secondProductId))
                .thenReturn(new InventoryResponse(
                        UUID.randomUUID(),
                        businessId,
                        secondProductId,
                        1,
                        5,
                        true
                ));

        assertThrows(
                InsufficientStockException.class,
                () -> orderService.placeOrder(businessId, request)
        );
        verify(inventoryService, never())
                .decreaseStock(any(UUID.class), any(UUID.class), anyInt());

        verify(orderRepository, never())
                .save(any(Order.class));
    }

    @Test
    void shouldGetOrdersForBusiness() {
        UUID businessId = UUID.randomUUID();

        Business business = mock(Business.class);
        when(business.getId()).thenReturn(businessId);

        Order order = new Order(business);

        when(orderRepository.findAllByBusinessId(businessId))
                .thenReturn(List.of(order));

        List<OrderResponse> responses = orderService.getOrders(businessId);

        assertEquals(1, responses.size());
        assertEquals(businessId, responses.getFirst().businessId());
        assertEquals(OrderStatus.CREATED, responses.getFirst().status());

        verify(orderRepository).findAllByBusinessId(businessId);
    }

    @Test
    void shouldGetOrderForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();

        Business business = mock(Business.class);
        when(business.getId()).thenReturn(businessId);

        Order order = mock(Order.class);
        when(order.getId()).thenReturn(orderId);
        when(order.getBusiness()).thenReturn(business);
        when(order.getStatus()).thenReturn(OrderStatus.CREATED);
        when(order.getCreatedAt()).thenReturn(Instant.parse("2026-09-24T12:00:00Z"));
        when(order.getItems()).thenReturn(List.of());

        when(orderRepository.findByIdAndBusinessId(orderId, businessId))
                .thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrder(businessId, orderId);

        assertEquals(orderId, response.id());
        assertEquals(businessId, response.businessId());
        assertEquals(OrderStatus.CREATED, response.status());
        assertEquals(BigDecimal.ZERO, response.totalPrice());
        assertEquals(Instant.parse("2026-09-24T12:00:00Z"), response.createdAt());
        assertTrue(response.items().isEmpty());

        verify(orderRepository).findByIdAndBusinessId(orderId, businessId);
    }

    @Test
    void shouldThrowWhenOrderDoesNotExistForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();

        when(orderRepository.findByIdAndBusinessId(orderId, businessId))
                .thenReturn(Optional.empty());

        assertThrows(
                OrderNotFoundException.class,
                () -> orderService.getOrder(businessId, orderId)
        );

        verify(orderRepository).findByIdAndBusinessId(orderId, businessId);
    }
}