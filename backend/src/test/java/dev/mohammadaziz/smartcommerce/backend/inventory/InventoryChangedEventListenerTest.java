package dev.mohammadaziz.smartcommerce.backend.inventory;

import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryChangedEvent;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class InventoryChangedEventListenerTest {

    @Test
    void shouldSendInventoryChangeThroughSse() {
        InventorySseService inventorySseService =
                mock(InventorySseService.class);

        InventoryChangedEventListener listener =
                new InventoryChangedEventListener(inventorySseService);

        InventoryChangedEvent event =
                new InventoryChangedEvent(
                        UUID.randomUUID(),
                        UUID.randomUUID(),
                        15
                );

        listener.handleInventoryChanged(event);

        verify(inventorySseService).send(event);
    }
}