package dev.mohammadaziz.smartcommerce.backend.supplier;

import dev.mohammadaziz.smartcommerce.backend.supplier.dto.CreateSupplierRequest;
import dev.mohammadaziz.smartcommerce.backend.supplier.dto.SupplierResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public List<SupplierResponse> getSuppliers(
            @PathVariable UUID businessId
    ) {
        return supplierService.getSuppliersByBusinessId(businessId);
    }

    @GetMapping("/{supplierId}")
    public SupplierResponse getSupplierById(
            @PathVariable UUID businessId,
            @PathVariable UUID supplierId
    ) {
        return supplierService.getSupplierById(businessId, supplierId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SupplierResponse createSupplier(
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateSupplierRequest request
    ) {
        return supplierService.createSupplier(businessId, request);
    }
}
