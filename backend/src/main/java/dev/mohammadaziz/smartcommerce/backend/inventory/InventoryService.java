package dev.mohammadaziz.smartcommerce.backend.inventory;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.inventory.dto.CreateInventoryRequest;
import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryResponse;
import dev.mohammadaziz.smartcommerce.backend.product.Product;
import dev.mohammadaziz.smartcommerce.backend.product.ProductNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.product.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final BusinessRepository businessRepository;
    private final ProductRepository productRepository;

    public InventoryService(
            InventoryRepository inventoryRepository,
            BusinessRepository businessRepository,
            ProductRepository productRepository
    ) {
        this.inventoryRepository = inventoryRepository;
        this.businessRepository = businessRepository;
        this.productRepository = productRepository;
    }

    public InventoryResponse createInventory(
            UUID businessId,
            CreateInventoryRequest request
    ) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new BusinessNotFoundException(businessId));

        Product product = productRepository
                .findByIdAndBusinessId(request.productId(), businessId)
                .orElseThrow(() -> new ProductNotFoundException(request.productId()));

        if (inventoryRepository.existsByBusinessIdAndProductId(
                businessId,
                request.productId()
        )) {
            throw new InventoryAlreadyExistsException(request.productId());
        }

        Inventory inventory = new Inventory(
                business,
                product,
                request.quantity(),
                request.lowStockThreshold()
        );

        Inventory savedInventory = inventoryRepository.save(inventory);

        return toResponse(savedInventory);
    }

    public InventoryResponse increaseStock(
            UUID businessId,
            UUID productId,
            int amount
    ) {
        Inventory inventory = getInventory(businessId, productId);

        inventory.increaseStock(amount);

        Inventory savedInventory = inventoryRepository.save(inventory);

        return toResponse(savedInventory);
    }

    public InventoryResponse decreaseStock(
            UUID businessId,
            UUID productId,
            int amount
    ) {
        Inventory inventory = getInventory(businessId, productId);

        inventory.decreaseStock(amount);

        Inventory savedInventory = inventoryRepository.save(inventory);

        return toResponse(savedInventory);
    }

    public InventoryResponse getInventoryResponse(
            UUID businessId,
            UUID productId
    ) {
        return toResponse(getInventory(businessId, productId));
    }

    private Inventory getInventory(
            UUID businessId,
            UUID productId
    ) {
        return inventoryRepository
                .findByBusinessIdAndProductId(businessId, productId)
                .orElseThrow(() -> new InventoryNotFoundException(productId));
    }

    private InventoryResponse toResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getBusiness().getId(),
                inventory.getProduct().getId(),
                inventory.getQuantity(),
                inventory.getLowStockThreshold(),
                inventory.isLowStock()
        );
    }
}