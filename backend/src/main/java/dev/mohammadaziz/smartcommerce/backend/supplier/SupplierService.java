package dev.mohammadaziz.smartcommerce.backend.supplier;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.supplier.dto.CreateSupplierRequest;
import dev.mohammadaziz.smartcommerce.backend.supplier.dto.SupplierResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final BusinessRepository businessRepository;

    public SupplierService(
            SupplierRepository supplierRepository,
            BusinessRepository businessRepository
    ) {
        this.supplierRepository = supplierRepository;
        this.businessRepository = businessRepository;
    }

    public SupplierResponse createSupplier(
            UUID businessId,
            CreateSupplierRequest request
    ) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new BusinessNotFoundException(businessId));

        Supplier supplier = new Supplier(
                business,
                request.name(),
                request.email(),
                request.phone(),
                request.country(),
                request.preferredCurrency()
        );

        Supplier savedSupplier = supplierRepository.save(supplier);

        return toResponse(savedSupplier);
    }

    public List<SupplierResponse> getSuppliersByBusinessId(UUID businessId) {
        return supplierRepository.findAllByBusinessId(businessId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SupplierResponse getSupplierById(
            UUID businessId,
            UUID supplierId
    ) {
        Supplier supplier = supplierRepository
                .findByIdAndBusinessId(supplierId, businessId)
                .orElseThrow(() -> new SupplierNotFoundException(supplierId));

        return toResponse(supplier);
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return new SupplierResponse(
                supplier.getId(),
                supplier.getBusiness().getId(),
                supplier.getName(),
                supplier.getEmail(),
                supplier.getPhone(),
                supplier.getCountry(),
                supplier.getPreferredCurrency()
        );
    }
}