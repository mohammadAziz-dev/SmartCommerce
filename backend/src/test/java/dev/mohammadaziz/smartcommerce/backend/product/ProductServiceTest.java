package dev.mohammadaziz.smartcommerce.backend.product;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.product.dto.CreateProductRequest;
import dev.mohammadaziz.smartcommerce.backend.product.dto.ProductResponse;
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
                businessId,
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

        ProductResponse response = productService.createProduct(request);

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
                businessId,
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
                () -> productService.createProduct(request)
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
}
