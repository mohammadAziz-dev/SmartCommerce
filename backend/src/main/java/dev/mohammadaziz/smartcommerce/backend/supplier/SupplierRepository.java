package dev.mohammadaziz.smartcommerce.backend.supplier;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    List<Supplier> findAllByBusinessId(UUID businessId);

    Optional<Supplier> findByIdAndBusinessId(UUID id, UUID businessId);
}
