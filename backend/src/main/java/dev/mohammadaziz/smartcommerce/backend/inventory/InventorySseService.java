package dev.mohammadaziz.smartcommerce.backend.inventory;

import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryChangedEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class InventorySseService {

    private final Map<UUID, List<SseEmitter>> emittersByBusiness =
            new ConcurrentHashMap<>();

    public SseEmitter subscribe(UUID businessId) {
        SseEmitter emitter = new SseEmitter(0L);

        emittersByBusiness
                .computeIfAbsent(businessId, id -> new CopyOnWriteArrayList<>())
                .add(emitter);

        emitter.onCompletion(() -> removeEmitter(businessId, emitter));
        emitter.onTimeout(() -> removeEmitter(businessId, emitter));
        emitter.onError(error -> removeEmitter(businessId, emitter));

        return emitter;
    }

    public void send(InventoryChangedEvent event) {
        List<SseEmitter> emitters = emittersByBusiness.get(event.businessId());

        if (emitters == null) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(
                        SseEmitter.event()
                                .name("inventory-changed")
                                .data(event)
                );
            } catch (IOException exception) {
                removeEmitter(event.businessId(), emitter);
            }
        }
    }

    private void removeEmitter(UUID businessId, SseEmitter emitter) {
        List<SseEmitter> emitters = emittersByBusiness.get(businessId);

        if (emitters == null) {
            return;
        }

        emitters.remove(emitter);

        if (emitters.isEmpty()) {
            emittersByBusiness.remove(businessId);
        }
    }
}