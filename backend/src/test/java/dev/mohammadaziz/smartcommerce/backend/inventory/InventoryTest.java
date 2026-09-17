package dev.mohammadaziz.smartcommerce.backend.inventory;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class InventoryTest {

    private final Business business = new Business("Test Business");

    private final Product product = new Product(
            business,
            "Test Product",
            "Test Description",
            "SKU-001",
            BigDecimal.valueOf(10),
            "Test Category",
            true
    );

    @Test
    void increaseStock_shouldIncreaseQuantity() {
        Inventory inventory = new Inventory(business, product, 10, 5);

        inventory.increaseStock(5);

        assertEquals(15, inventory.getQuantity());
    }

    @Test
    void decreaseStock_shouldDecreaseQuantity() {
        Inventory inventory = new Inventory(business, product, 10, 5);

        inventory.decreaseStock(4);

        assertEquals(6, inventory.getQuantity());
    }

    @Test
    void decreaseStock_shouldThrowException_whenAmountExceedsQuantity() {
        Inventory inventory = new Inventory(business, product, 3, 5);

        assertThrows(
                InsufficientStockException.class,
                () -> inventory.decreaseStock(4)
        );
    }

    @Test
    void isLowStock_shouldReturnTrue_whenQuantityEqualsThreshold() {
        Inventory inventory = new Inventory(business, product, 5, 5);

        assertTrue(inventory.isLowStock());
    }

    @Test
    void isLowStock_shouldReturnTrue_whenQuantityIsBelowThreshold() {
        Inventory inventory = new Inventory(business, product, 3, 5);

        assertTrue(inventory.isLowStock());
    }

    @Test
    void isLowStock_shouldReturnFalse_whenQuantityIsAboveThreshold() {
        Inventory inventory = new Inventory(business, product, 10, 5);

        assertFalse(inventory.isLowStock());
    }

    @Test
    void constructor_shouldThrowException_whenQuantityIsNegative() {
        assertThrows(
                IllegalArgumentException.class,
                () -> new Inventory(business, product, -1, 5)
        );
    }

    @Test
    void increaseStock_shouldThrowException_whenAmountIsNotPositive() {
        Inventory inventory = new Inventory(business, product, 10, 5);

        assertThrows(
                IllegalArgumentException.class,
                () -> inventory.increaseStock(0)
        );
    }

    @Test
    void decreaseStock_shouldThrowException_whenAmountIsNotPositive() {
        Inventory inventory = new Inventory(business, product, 10, 5);

        assertThrows(
                IllegalArgumentException.class,
                () -> inventory.decreaseStock(0)
        );
    }
}
