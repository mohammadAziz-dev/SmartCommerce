package dev.mohammadaziz.smartcommerce.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    Optional<Inventory> findByBusinessIdAndProductId(
            UUID businessId,
            UUID productId
    );

    boolean existsByBusinessIdAndProductId(
            UUID businessId,
            UUID productId
    );
}