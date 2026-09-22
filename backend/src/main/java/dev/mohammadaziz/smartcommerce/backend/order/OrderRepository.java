package dev.mohammadaziz.smartcommerce.backend.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findAllByBusinessId(UUID businessId);

    Optional<Order> findByIdAndBusinessId(UUID id, UUID businessId);
}