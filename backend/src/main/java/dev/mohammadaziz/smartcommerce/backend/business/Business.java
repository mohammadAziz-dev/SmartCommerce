package dev.mohammadaziz.smartcommerce.backend.business;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor
public class Business {

    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    public Business(String name) {
        this.name = name;
    }
}