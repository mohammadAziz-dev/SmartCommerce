package dev.mohammadaziz.smartcommerce.backend.inventory;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @OneToOne(optional = false)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private int lowStockThreshold;

    public Inventory(
            Business business,
            Product product,
            int quantity,
            int lowStockThreshold
    ) {
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        if (lowStockThreshold < 0) {
            throw new IllegalArgumentException("Low stock threshold cannot be negative");
        }

        this.business = business;
        this.product = product;
        this.quantity = quantity;
        this.lowStockThreshold = lowStockThreshold;
    }

    public void increaseStock(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Stock increase amount must be greater than zero");
        }

        this.quantity += amount;
    }

    public void decreaseStock(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Stock decrease amount must be greater than zero");
        }

        if (amount > this.quantity) {
            throw new InsufficientStockException();
        }

        this.quantity -= amount;
    }

    public boolean isLowStock() {
        return this.quantity <= this.lowStockThreshold;
    }
}
