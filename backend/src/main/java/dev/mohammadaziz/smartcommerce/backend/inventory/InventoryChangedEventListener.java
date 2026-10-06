package dev.mohammadaziz.smartcommerce.backend.inventory;

import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryChangedEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class InventoryChangedEventListener {

    private final InventorySseService inventorySseService;

    public InventoryChangedEventListener(
            InventorySseService inventorySseService
    ) {
        this.inventorySseService = inventorySseService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleInventoryChanged(InventoryChangedEvent event) {
        inventorySseService.send(event);
    }
}