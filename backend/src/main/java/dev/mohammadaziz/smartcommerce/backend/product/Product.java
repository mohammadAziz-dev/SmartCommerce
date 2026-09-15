package dev.mohammadaziz.smartcommerce.backend.product;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String name;

    private String description;
    private String sku;

    @Column(nullable = false)
    private BigDecimal sellingPrice;

    private String category;
    private boolean active;

    public Product(
            Business business,
            String name,
            String description,
            String sku,
            BigDecimal sellingPrice,
            String category,
            boolean active
    ) {
        this.business = business;
        this.name = name;
        this.description = description;
        this.sku = sku;
        this.sellingPrice = sellingPrice;
        this.category = category;
        this.active = active;
    }
}