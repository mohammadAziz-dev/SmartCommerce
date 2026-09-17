package dev.mohammadaziz.smartcommerce.backend.inventory;

import dev.mohammadaziz.smartcommerce.backend.inventory.dto.CreateInventoryRequest;
import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryResponse;
import dev.mohammadaziz.smartcommerce.backend.inventory.dto.StockAdjustmentRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryResponse createInventory(
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateInventoryRequest request
    ) {
        return inventoryService.createInventory(businessId, request);
    }

    @GetMapping("/{productId}")
    public InventoryResponse getInventory(
            @PathVariable UUID businessId,
            @PathVariable UUID productId
    ) {
        return inventoryService.getInventoryResponse(businessId, productId);
    }

    @PatchMapping("/{productId}/increase")
    public InventoryResponse increaseStock(
            @PathVariable UUID businessId,
            @PathVariable UUID productId,
            @Valid @RequestBody StockAdjustmentRequest request
    ) {
        return inventoryService.increaseStock(
                businessId,
                productId,
                request.amount()
        );
    }

    @PatchMapping("/{productId}/decrease")
    public InventoryResponse decreaseStock(
            @PathVariable UUID businessId,
            @PathVariable UUID productId,
            @Valid @RequestBody StockAdjustmentRequest request
    ) {
        return inventoryService.decreaseStock(
                businessId,
                productId,
                request.amount()
        );
    }
}
