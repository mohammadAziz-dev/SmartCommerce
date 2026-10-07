package dev.mohammadaziz.smartcommerce.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    List<Inventory> findAllByBusinessId(UUID businessId);

    Optional<Inventory> findByBusinessIdAndProductId(
            UUID businessId,
            UUID productId
    );

    boolean existsByBusinessIdAndProductId(
            UUID businessId,
            UUID productId
    );
}