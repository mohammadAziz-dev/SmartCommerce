package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.inventory.InsufficientStockException;
import dev.mohammadaziz.smartcommerce.backend.inventory.InventoryService;
import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryResponse;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderItemRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderItemResponse;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final BusinessRepository businessRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public OrderService(
            OrderRepository orderRepository,
            BusinessRepository businessRepository,
            ProductRepository productRepository,
            InventoryService inventoryService
    ) {
        this.orderRepository = orderRepository;
        this.businessRepository = businessRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public OrderResponse placeOrder(UUID businessId, CreateOrderRequest request) {
        Business business = businessRepository
                .findById(businessId)
                .orElseThrow(() -> new BusinessNotFoundException(businessId));

        List<ValidatedOrderItem> validatedItems = new ArrayList<>();
        Set<UUID> productIds = new HashSet<>();

        for (CreateOrderItemRequest itemRequest : request.items()) {
            if (!productIds.add(itemRequest.productId())) {
                throw new DuplicateOrderProductException();
            }

            Product product = productRepository
                    .findByIdAndBusinessId(itemRequest.productId(), businessId)
                    .orElseThrow(() -> new ProductNotFoundException(itemRequest.productId()));

            InventoryResponse inventory =
                    inventoryService.getInventoryResponse(businessId, product.getId());

            if (inventory.quantity() < itemRequest.quantity()) {
                throw new InsufficientStockException();
            }

            validatedItems.add(
                    new ValidatedOrderItem(product, itemRequest.quantity())
            );
        }

        Order order = new Order(business);

        for (ValidatedOrderItem validatedItem : validatedItems) {
            Product product = validatedItem.product();

            order.addItem(
                    product,
                    validatedItem.quantity(),
                    product.getSellingPrice()
            );

            inventoryService.decreaseStock(
                    businessId,
                    product.getId(),
                    validatedItem.quantity()
            );
        }

        Order savedOrder = orderRepository.save(order);

        return toOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(UUID businessId) {
        return orderRepository.findAllByBusinessId(businessId)
                .stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID businessId, UUID orderId) {
        Order order = orderRepository.findByIdAndBusinessId(orderId, businessId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        return toOrderResponse(order);
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems()
                .stream()
                .map(item -> {
                    BigDecimal subtotal = item.getUnitPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));

                    return new OrderItemResponse(
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getQuantity(),
                            item.getUnitPrice(),
                            subtotal
                    );
                })
                .toList();

        BigDecimal totalPrice = itemResponses.stream()
                .map(OrderItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderResponse(
                order.getId(),
                order.getBusiness().getId(),
                order.getStatus(),
                totalPrice,
                order.getCreatedAt(),
                itemResponses
        );
    }

    private record ValidatedOrderItem(Product product, int quantity) {
    }
}