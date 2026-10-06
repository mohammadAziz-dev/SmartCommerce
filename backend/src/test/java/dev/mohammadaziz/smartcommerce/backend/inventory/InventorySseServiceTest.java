package dev.mohammadaziz.smartcommerce.backend.inventory;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class InventorySseServiceTest {

    private final InventorySseService inventorySseService =
            new InventorySseService();

    @Test
    void shouldCreateSubscriptionForBusiness() {
        UUID businessId = UUID.randomUUID();

        SseEmitter emitter = inventorySseService.subscribe(businessId);

        assertNotNull(emitter);
    }
}