package dev.mohammadaziz.smartcommerce.backend.inventory;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/inventory")
public class InventorySseController {

    private final InventorySseService inventorySseService;

    public InventorySseController(InventorySseService inventorySseService) {
        this.inventorySseService = inventorySseService;
    }

    @GetMapping(
            value = "/events",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter subscribe(@PathVariable UUID businessId) {
        return inventorySseService.subscribe(businessId);
    }
}