package dev.mohammadaziz.smartcommerce.backend.supplier;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String name;

    private String email;
    private String phone;
    private String country;
    private String preferredCurrency;

    public Supplier(
            Business business,
            String name,
            String email,
            String phone,
            String country,
            String preferredCurrency
    ) {
        this.business = business;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.country = country;
        this.preferredCurrency = preferredCurrency;
    }
}