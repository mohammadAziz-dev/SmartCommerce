package dev.mohammadaziz.smartcommerce.backend.product;

import dev.mohammadaziz.smartcommerce.backend.product.dto.CreateProductRequest;
import dev.mohammadaziz.smartcommerce.backend.product.dto.ProductResponse;
import dev.mohammadaziz.smartcommerce.backend.product.dto.UpdateProductRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @Test
    void shouldReturnProductsForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();

        ProductResponse product = new ProductResponse(
                UUID.randomUUID(),
                businessId,
                "Wireless Mouse",
                null,
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                true
        );

        when(productService.getProductsByBusinessId(businessId))
                .thenReturn(List.of(product));

        mockMvc.perform(
                        get("/api/businesses/{businessId}/products", businessId)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Wireless Mouse"))
                .andExpect(jsonPath("$[0].sku").value("MOUSE-001"))
                .andExpect(jsonPath("$[0].sellingPrice").value(29.99))
                .andExpect(jsonPath("$[0].active").value(true));
    }

    @Test
    void shouldReturnProductByIdForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        ProductResponse product = new ProductResponse(
                productId,
                businessId,
                "Wireless Mouse",
                "Wireless ergonomic mouse",
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                true
        );

        when(productService.getProductById(businessId, productId))
                .thenReturn(product);

        mockMvc.perform(
                        get(
                                "/api/businesses/{businessId}/products/{productId}",
                                businessId,
                                productId
                        )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId.toString()))
                .andExpect(jsonPath("$.businessId").value(businessId.toString()))
                .andExpect(jsonPath("$.name").value("Wireless Mouse"))
                .andExpect(jsonPath("$.sku").value("MOUSE-001"))
                .andExpect(jsonPath("$.sellingPrice").value(29.99))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldReturnNotFoundWhenProductDoesNotExistForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        when(productService.getProductById(businessId, productId))
                .thenThrow(new ProductNotFoundException(productId));

        mockMvc.perform(
                        get(
                                "/api/businesses/{businessId}/products/{productId}",
                                businessId,
                                productId
                        )
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreateProductForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        ProductResponse response = new ProductResponse(
                productId,
                businessId,
                "Wireless Mouse",
                "Wireless ergonomic mouse",
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                true
        );

        when(productService.createProduct(
                eq(businessId),
                any(CreateProductRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                        post("/api/businesses/{businessId}/products", businessId)
                                .contentType("application/json")
                                .content("""
                                    {
                                      "name": "Wireless Mouse",
                                      "description": "Wireless ergonomic mouse",
                                      "sku": "MOUSE-001",
                                      "sellingPrice": 29.99,
                                      "category": "Electronics",
                                      "active": true
                                    }
                                    """)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(productId.toString()))
                .andExpect(jsonPath("$.businessId").value(businessId.toString()))
                .andExpect(jsonPath("$.name").value("Wireless Mouse"))
                .andExpect(jsonPath("$.sellingPrice").value(29.99))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldReturnBadRequestWhenProductNameIsBlank() throws Exception {
        UUID businessId = UUID.randomUUID();

        mockMvc.perform(
                        post("/api/businesses/{businessId}/products", businessId)
                                .contentType("application/json")
                                .content("""
                                    {
                                      "name": "",
                                      "description": "Wireless ergonomic mouse",
                                      "sku": "MOUSE-001",
                                      "sellingPrice": 29.99,
                                      "category": "Electronics",
                                      "active": true
                                    }
                                    """)
                )
                .andExpect(status().isBadRequest());

        verify(productService, never())
                .createProduct(eq(businessId), any(CreateProductRequest.class));
    }

    @Test
    void shouldReturnBadRequestWhenSellingPriceIsNegative() throws Exception {
        UUID businessId = UUID.randomUUID();

        mockMvc.perform(
                        post("/api/businesses/{businessId}/products", businessId)
                                .contentType("application/json")
                                .content("""
                                    {
                                      "name": "Wireless Mouse",
                                      "description": "Wireless ergonomic mouse",
                                      "sku": "MOUSE-001",
                                      "sellingPrice": -10.00,
                                      "category": "Electronics",
                                      "active": true
                                    }
                                    """)
                )
                .andExpect(status().isBadRequest());

        verify(productService, never())
                .createProduct(eq(businessId), any(CreateProductRequest.class));
    }

    @Test
    void shouldUpdateProductForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        ProductResponse response = new ProductResponse(
                productId,
                businessId,
                "Gaming Mouse",
                "Updated description",
                "MOUSE-002",
                new BigDecimal("39.99"),
                "Gaming",
                true
        );

        when(productService.updateProduct(
                eq(businessId),
                eq(productId),
                any(UpdateProductRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                        put(
                                "/api/businesses/{businessId}/products/{productId}",
                                businessId,
                                productId
                        )
                                .contentType("application/json")
                                .content("""
                                    {
                                      "name": "Gaming Mouse",
                                      "description": "Updated description",
                                      "sku": "MOUSE-002",
                                      "sellingPrice": 39.99,
                                      "category": "Gaming",
                                      "active": true
                                    }
                                    """)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId.toString()))
                .andExpect(jsonPath("$.businessId").value(businessId.toString()))
                .andExpect(jsonPath("$.name").value("Gaming Mouse"))
                .andExpect(jsonPath("$.sku").value("MOUSE-002"))
                .andExpect(jsonPath("$.sellingPrice").value(39.99))
                .andExpect(jsonPath("$.category").value("Gaming"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldReturnNotFoundWhenUpdatingProductDoesNotExistForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        when(productService.updateProduct(
                eq(businessId),
                eq(productId),
                any(UpdateProductRequest.class)
        )).thenThrow(new ProductNotFoundException(productId));

        mockMvc.perform(
                        put(
                                "/api/businesses/{businessId}/products/{productId}",
                                businessId,
                                productId
                        )
                                .contentType("application/json")
                                .content("""
                                    {
                                      "name": "Gaming Mouse",
                                      "sellingPrice": 39.99,
                                      "active": true
                                    }
                                    """)
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnBadRequestWhenUpdatingWithInvalidData() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        mockMvc.perform(
                        put(
                                "/api/businesses/{businessId}/products/{productId}",
                                businessId,
                                productId
                        )
                                .contentType("application/json")
                                .content("""
                                    {
                                      "name": "",
                                      "sellingPrice": -10.00,
                                      "active": true
                                    }
                                    """)
                )
                .andExpect(status().isBadRequest());

        verify(productService, never())
                .updateProduct(
                        eq(businessId),
                        eq(productId),
                        any(UpdateProductRequest.class)
                );
    }

    @Test
    void shouldDeactivateProductForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        ProductResponse response = new ProductResponse(
                productId,
                businessId,
                "Wireless Mouse",
                null,
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                false
        );

        when(productService.deactivateProduct(businessId, productId))
                .thenReturn(response);

        mockMvc.perform(
                        patch(
                                "/api/businesses/{businessId}/products/{productId}/deactivate",
                                businessId,
                                productId
                        )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId.toString()))
                .andExpect(jsonPath("$.name").value("Wireless Mouse"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldReturnNotFoundWhenDeactivatingProductDoesNotExistForBusiness()
            throws Exception {

        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        when(productService.deactivateProduct(businessId, productId))
                .thenThrow(new ProductNotFoundException(productId));

        mockMvc.perform(
                        patch(
                                "/api/businesses/{businessId}/products/{productId}/deactivate",
                                businessId,
                                productId
                        )
                )
                .andExpect(status().isNotFound());
    }
}