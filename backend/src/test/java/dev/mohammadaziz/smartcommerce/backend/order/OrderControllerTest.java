package dev.mohammadaziz.smartcommerce.backend.order;

import dev.mohammadaziz.smartcommerce.backend.inventory.InsufficientStockException;
import dev.mohammadaziz.smartcommerce.backend.product.ProductNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import dev.mohammadaziz.smartcommerce.backend.order.dto.CreateOrderRequest;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderItemResponse;
import dev.mohammadaziz.smartcommerce.backend.order.dto.OrderResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @Test
    void shouldPlaceOrderForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        OrderItemResponse itemResponse = new OrderItemResponse(
                productId,
                "Wireless Mouse",
                2,
                new BigDecimal("29.99"),
                new BigDecimal("59.98")
        );

        OrderResponse response = new OrderResponse(
                orderId,
                businessId,
                OrderStatus.CREATED,
                new BigDecimal("59.98"),
                List.of(itemResponse)
        );

        when(orderService.placeOrder(
                eq(businessId),
                any(CreateOrderRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                        post("/api/businesses/{businessId}/orders", businessId)
                                .contentType("application/json")
                                .content("""
                                        {
                                          "items": [
                                            {
                                              "productId": "%s",
                                              "quantity": 2
                                            }
                                          ]
                                        }
                                        """.formatted(productId))
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(orderId.toString()))
                .andExpect(jsonPath("$.businessId").value(businessId.toString()))
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.totalPrice").value(59.98))
                .andExpect(jsonPath("$.items[0].productId").value(productId.toString()))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.items[0].unitPrice").value(29.99))
                .andExpect(jsonPath("$.items[0].subtotal").value(59.98));
    }

    @Test
    void shouldReturnBadRequestWhenOrderItemsAreEmpty() throws Exception {
        UUID businessId = UUID.randomUUID();

        mockMvc.perform(
                        post("/api/businesses/{businessId}/orders", businessId)
                                .contentType("application/json")
                                .content("""
                                        {
                                          "items": []
                                        }
                                        """)
                )
                .andExpect(status().isBadRequest());

        verify(orderService, never())
                .placeOrder(eq(businessId), any(CreateOrderRequest.class));
    }

    @Test
    void shouldReturnBadRequestWhenOrderItemQuantityIsZero() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        mockMvc.perform(
                        post("/api/businesses/{businessId}/orders", businessId)
                                .contentType("application/json")
                                .content("""
                                        {
                                          "items": [
                                            {
                                              "productId": "%s",
                                              "quantity": 0
                                            }
                                          ]
                                        }
                                        """.formatted(productId))
                )
                .andExpect(status().isBadRequest());

        verify(orderService, never())
                .placeOrder(eq(businessId), any(CreateOrderRequest.class));
    }

    @Test
    void shouldReturnBadRequestWhenStockIsInsufficient() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        when(orderService.placeOrder(
                eq(businessId),
                any(CreateOrderRequest.class)
        )).thenThrow(new InsufficientStockException());

        mockMvc.perform(
                        post("/api/businesses/{businessId}/orders", businessId)
                                .contentType("application/json")
                                .content("""
                                        {
                                          "items": [
                                            {
                                              "productId": "%s",
                                              "quantity": 5
                                            }
                                          ]
                                        }
                                        """.formatted(productId))
                )
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnNotFoundWhenProductDoesNotExistForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        when(orderService.placeOrder(
                eq(businessId),
                any(CreateOrderRequest.class)
        )).thenThrow(new ProductNotFoundException(productId));

        mockMvc.perform(
                        post("/api/businesses/{businessId}/orders", businessId)
                                .contentType("application/json")
                                .content("""
                                        {
                                          "items": [
                                            {
                                              "productId": "%s",
                                              "quantity": 2
                                            }
                                          ]
                                        }
                                        """.formatted(productId))
                )
                .andExpect(status().isNotFound());
    }
}