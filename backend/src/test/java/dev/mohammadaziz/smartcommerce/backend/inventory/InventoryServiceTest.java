package dev.mohammadaziz.smartcommerce.backend.inventory;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.inventory.dto.CreateInventoryRequest;
import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryResponse;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    void shouldCreateInventoryForProductAndBusiness() {
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

        CreateInventoryRequest request =
                new CreateInventoryRequest(productId, 20, 5);

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(product));

        when(inventoryRepository.existsByBusinessIdAndProductId(
                businessId,
                productId
        )).thenReturn(false);

        when(inventoryRepository.save(any(Inventory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        InventoryResponse response =
                inventoryService.createInventory(businessId, request);

        assertEquals(20, response.quantity());
        assertEquals(5, response.lowStockThreshold());
        assertFalse(response.lowStock());

        verify(businessRepository).findById(businessId);
        verify(productRepository)
                .findByIdAndBusinessId(productId, businessId);
        verify(inventoryRepository).save(any(Inventory.class));
    }

    @Test
    void shouldRejectProductFromAnotherBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Business business = new Business("Aziz Electronics");

        CreateInventoryRequest request =
                new CreateInventoryRequest(productId, 20, 5);

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.empty());

        assertThrows(
                ProductNotFoundException.class,
                () -> inventoryService.createInventory(businessId, request)
        );

        verify(inventoryRepository, never())
                .save(any(Inventory.class));
    }

    @Test
    void shouldIncreaseStock() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Inventory inventory = createInventory();

        when(inventoryRepository
                .findByBusinessIdAndProductId(businessId, productId))
                .thenReturn(Optional.of(inventory));

        when(inventoryRepository.save(inventory))
                .thenReturn(inventory);

        InventoryResponse response =
                inventoryService.increaseStock(businessId, productId, 10);

        assertEquals(30, response.quantity());

        verify(inventoryRepository).save(inventory);
    }

    @Test
    void shouldDecreaseStock() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Inventory inventory = createInventory();

        when(inventoryRepository
                .findByBusinessIdAndProductId(businessId, productId))
                .thenReturn(Optional.of(inventory));

        when(inventoryRepository.save(inventory))
                .thenReturn(inventory);

        InventoryResponse response =
                inventoryService.decreaseStock(businessId, productId, 5);

        assertEquals(15, response.quantity());

        verify(inventoryRepository).save(inventory);
    }

    @Test
    void shouldThrowExceptionWhenInventoryDoesNotExist() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        when(inventoryRepository
                .findByBusinessIdAndProductId(businessId, productId))
                .thenReturn(Optional.empty());

        assertThrows(
                InventoryNotFoundException.class,
                () -> inventoryService
                        .getInventoryResponse(businessId, productId)
        );
    }

    @Test
    void shouldThrowExceptionWhenInventoryAlreadyExistsForProduct() {
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

        CreateInventoryRequest request =
                new CreateInventoryRequest(productId, 20, 5);

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        when(productRepository.findByIdAndBusinessId(productId, businessId))
                .thenReturn(Optional.of(product));

        when(inventoryRepository.existsByBusinessIdAndProductId(
                businessId,
                productId
        )).thenReturn(true);

        assertThrows(
                InventoryAlreadyExistsException.class,
                () -> inventoryService.createInventory(businessId, request)
        );

        verify(inventoryRepository, never())
                .save(any(Inventory.class));
    }

    private Inventory createInventory() {
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

        return new Inventory(business, product, 20, 5);
    }
}
