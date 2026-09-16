package dev.mohammadaziz.smartcommerce.backend.product;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.product.dto.CreateProductRequest;
import dev.mohammadaziz.smartcommerce.backend.product.dto.ProductResponse;
import dev.mohammadaziz.smartcommerce.backend.product.dto.UpdateProductRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BusinessRepository businessRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void shouldCreateProductForBusiness() {
        UUID businessId = UUID.randomUUID();
        Business business = new Business("Aziz Electronics");

        CreateProductRequest request = new CreateProductRequest(
                "Wireless Mouse",
                "Wireless ergonomic mouse",
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                true
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        Product savedProduct = new Product(
                business,
                request.name(),
                request.description(),
                request.sku(),
                request.sellingPrice(),
                request.category(),
                request.active()
        );

        when(productRepository.save(any(Product.class)))
                .thenReturn(savedProduct);

        ProductResponse response = productService.createProduct(businessId, request);

        assertEquals("Wireless Mouse", response.name());
        assertEquals(new BigDecimal("29.99"), response.sellingPrice());
        assertTrue(response.active());

        verify(businessRepository).findById(businessId);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void shouldThrowExceptionWhenBusinessDoesNotExist() {
        UUID businessId = UUID.randomUUID();

        CreateProductRequest request = new CreateProductRequest(
                "Wireless Mouse",
                null,
                null,
                new BigDecimal("29.99"),
                null,
                true
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessNotFoundException.class,
                () -> productService.createProduct(businessId, request)
        );

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void shouldReturnProductsForBusiness() {
        UUID businessId = UUID.randomUUID();
        Business business = new Business("Aziz Electronics");

        Product mouse = new Product(
                business,
                "Wireless Mouse",
                null,
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                true
        );

        when(productRepository.findAllByBusinessId(businessId))
                .thenReturn(List.of(mouse));

        List<ProductResponse> products =
                productService.getProductsByBusinessId(businessId);

        assertEquals(1, products.size());
        assertEquals("Wireless Mouse", products.getFirst().name());

        verify(productRepository).findAllByBusinessId(businessId);
    }

    @Test
    void shouldReturnOnlyProductsForRequestedBusiness() {
        UUID businessAId = UUID.randomUUID();
        UUID businessBId = UUID.randomUUID();

        Business businessA = new Business("Aziz Electronics");

        Product mouse = new Product(
                businessA,
                "Wireless Mouse",
                null,
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                true
        );

        when(productRepository.findAllByBusinessId(businessAId))
                .thenReturn(List.of(mouse));

        List<ProductResponse> products =
                productService.getProductsByBusinessId(businessAId);

        assertEquals(1, products.size());
        assertEquals("Wireless Mouse", products.getFirst().name());

        verify(productRepository).findAllByBusinessId(businessAId);
        verify(productRepository, never()).findAllByBusinessId(businessBId);
    }

    @Test
    void shouldReturnProductByIdForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = new Business("Aziz Electronics");

        Product mouse = new Product(
                business,
                "Wireless Mouse",
                null,
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                true
        );

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(mouse));

        ProductResponse response =
                productService.getProductById(businessId, productId);

        assertEquals("Wireless Mouse", response.name());
        assertEquals("MOUSE-001", response.sku());
        assertEquals(new BigDecimal("29.99"), response.sellingPrice());

        verify(productRepository)
                .findByIdAndBusinessId(productId, businessId);
    }

    @Test
    void shouldThrowExceptionWhenProductDoesNotExistForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.empty());

        assertThrows(
                ProductNotFoundException.class,
                () -> productService.getProductById(businessId, productId)
        );

        verify(productRepository)
                .findByIdAndBusinessId(productId, businessId);
    }

    @Test
    void shouldUpdateProductForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = new Business("Aziz Electronics");

        Product existingProduct = new Product(
                business,
                "Wireless Mouse",
                "Old description",
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                true
        );

        UpdateProductRequest request = new UpdateProductRequest(
                "Gaming Mouse",
                "Updated description",
                "MOUSE-002",
                new BigDecimal("39.99"),
                "Gaming",
                true
        );

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(existingProduct));

        when(productRepository.save(existingProduct))
                .thenReturn(existingProduct);

        ProductResponse response =
                productService.updateProduct(businessId, productId, request);

        assertEquals("Gaming Mouse", response.name());
        assertEquals("Updated description", response.description());
        assertEquals("MOUSE-002", response.sku());
        assertEquals(new BigDecimal("39.99"), response.sellingPrice());
        assertEquals("Gaming", response.category());
        assertTrue(response.active());

        verify(productRepository)
                .findByIdAndBusinessId(productId, businessId);

        verify(productRepository).save(existingProduct);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingProductNotFoundForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        UpdateProductRequest request = new UpdateProductRequest(
                "Gaming Mouse",
                "Updated description",
                "MOUSE-002",
                new BigDecimal("39.99"),
                "Gaming",
                true
        );

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.empty());

        assertThrows(
                ProductNotFoundException.class,
                () -> productService.updateProduct(businessId, productId, request)
        );

        verify(productRepository)
                .findByIdAndBusinessId(productId, businessId);

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void shouldDeactivateProductForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = new Business("Aziz Electronics");

        Product product = new Product(
                business,
                "Wireless Mouse",
                null,
                "MOUSE-001",
                new BigDecimal("29.99"),
                "Electronics",
                true
        );

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(product));

        when(productRepository.save(product))
                .thenReturn(product);

        ProductResponse response =
                productService.deactivateProduct(businessId, productId);

        assertFalse(response.active());

        verify(productRepository)
                .findByIdAndBusinessId(productId, businessId);

        verify(productRepository).save(product);
    }

    @Test
    void shouldThrowExceptionWhenDeactivatingProductNotFoundForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.empty());

        assertThrows(
                ProductNotFoundException.class,
                () -> productService.deactivateProduct(businessId, productId)
        );

        verify(productRepository)
                .findByIdAndBusinessId(productId, businessId);

        verify(productRepository, never()).save(any(Product.class));
    }
}
