package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderResponse> getOrders(@PathVariable UUID businessId) {
        return orderService.getOrders(businessId);
    }

    @GetMapping("/{orderId}")
    public OrderResponse getOrder(
            @PathVariable UUID businessId,
            @PathVariable UUID orderId
    ) {
        return orderService.getOrder(businessId, orderId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        return orderService.placeOrder(businessId, request);
    }
}
