package dev.mohammadaziz.smartcommerce.backend.inventory;

import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryChangedEvent;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InventorySseServiceTest {

    @Test
    void shouldCreateSubscriptionForBusiness() {
        InventorySseService inventorySseService =
                new InventorySseService();

        UUID businessId = UUID.randomUUID();

        SseEmitter emitter =
                inventorySseService.subscribe(businessId);

        assertNotNull(emitter);
    }

    @Test
    void shouldSendInventoryChangeToSubscribedBusiness()
            throws IOException {

        SseEmitter emitter = mock(SseEmitter.class);

        InventorySseService inventorySseService =
                spy(new InventorySseService());

        doReturn(emitter)
                .when(inventorySseService)
                .createEmitter();

        UUID businessId = UUID.randomUUID();

        inventorySseService.subscribe(businessId);

        InventoryChangedEvent event =
                new InventoryChangedEvent(
                        businessId,
                        UUID.randomUUID(),
                        15
                );

        inventorySseService.send(event);

        verify(emitter).send(any(SseEmitter.SseEventBuilder.class));
    }

    @Test
    void shouldDoNothingWhenBusinessHasNoSubscribers() {
        InventorySseService inventorySseService =
                new InventorySseService();

        InventoryChangedEvent event =
                new InventoryChangedEvent(
                        UUID.randomUUID(),
                        UUID.randomUUID(),
                        15
                );

        inventorySseService.send(event);
    }

    @Test
    void shouldRemoveEmitterWhenSendingFails()
            throws IOException {

        SseEmitter emitter = mock(SseEmitter.class);

        InventorySseService inventorySseService =
                spy(new InventorySseService());

        doReturn(emitter)
                .when(inventorySseService)
                .createEmitter();

        UUID businessId = UUID.randomUUID();

        inventorySseService.subscribe(businessId);

        doThrow(new IOException())
                .when(emitter)
                .send(any(SseEmitter.SseEventBuilder.class));

        InventoryChangedEvent event =
                new InventoryChangedEvent(
                        businessId,
                        UUID.randomUUID(),
                        15
                );

        inventorySseService.send(event);

        // The failed emitter was removed, so sending again
        // should not call the emitter again.
        inventorySseService.send(event);

        verify(emitter, times(1))
                .send(any(SseEmitter.SseEventBuilder.class));
    }
}