package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.inventory.InventoryService;
import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;

import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderItemRequest;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryResponse;
import dev.mohammadaziz.smartcommerce.backend.inventory.InsufficientStockException;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderItemResponse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.HashSet;
import java.util.Set;
import java.math.BigDecimal;

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

            InventoryResponse inventory = inventoryService.getInventoryResponse(businessId, product.getId());

            if (inventory.quantity() < itemRequest.quantity()) {
                throw new InsufficientStockException();
            }

            validatedItems.add(new ValidatedOrderItem(product, itemRequest.quantity()));
        }

        Order order = new Order(business);

        for (ValidatedOrderItem validatedItem : validatedItems) {
            Product product = validatedItem.product();

            order.addItem(product, validatedItem.quantity(), product.getSellingPrice());

            inventoryService.decreaseStock(businessId, product.getId(), validatedItem.quantity());
        }

        Order savedOrder = orderRepository.save(order);

        List<OrderItemResponse> itemResponses = savedOrder.getItems()
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
                savedOrder.getId(),
                savedOrder.getBusiness().getId(),
                savedOrder.getStatus(),
                totalPrice,
                itemResponses
        );
    }

    private record ValidatedOrderItem(Product product, int quantity) {
    }
}
