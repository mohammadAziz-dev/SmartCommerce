package dev.mohammadaziz.smartcommerce.backend.supplier;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.supplier.dto.CreateSupplierRequest;
import dev.mohammadaziz.smartcommerce.backend.supplier.dto.SupplierResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private BusinessRepository businessRepository;

    @InjectMocks
    private SupplierService supplierService;

    @Test
    void shouldCreateSupplierForBusiness() {
        UUID businessId = UUID.randomUUID();
        Business business = new Business("Aziz Electronics");

        CreateSupplierRequest request = new CreateSupplierRequest(
                "TechSupply GmbH",
                "contact@techsupply.de",
                "+49 511 123456",
                "Germany",
                "EUR"
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.of(business));

        Supplier savedSupplier = new Supplier(
                business,
                request.name(),
                request.email(),
                request.phone(),
                request.country(),
                request.preferredCurrency()
        );

        when(supplierRepository.save(any(Supplier.class)))
                .thenReturn(savedSupplier);

        SupplierResponse response =
                supplierService.createSupplier(businessId, request);

        assertEquals("TechSupply GmbH", response.name());
        assertEquals("contact@techsupply.de", response.email());
        assertEquals("Germany", response.country());
        assertEquals("EUR", response.preferredCurrency());

        verify(businessRepository).findById(businessId);
        verify(supplierRepository).save(any(Supplier.class));
    }

    @Test
    void shouldThrowExceptionWhenBusinessDoesNotExist() {
        UUID businessId = UUID.randomUUID();

        CreateSupplierRequest request = new CreateSupplierRequest(
                "TechSupply GmbH",
                null,
                null,
                null,
                null
        );

        when(businessRepository.findById(businessId))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessNotFoundException.class,
                () -> supplierService.createSupplier(businessId, request)
        );

        verify(supplierRepository, never()).save(any(Supplier.class));
    }

    @Test
    void shouldReturnSuppliersForBusiness() {
        UUID businessId = UUID.randomUUID();
        Business business = new Business("Aziz Electronics");

        Supplier supplier = new Supplier(
                business,
                "TechSupply GmbH",
                "contact@techsupply.de",
                "+49 511 123456",
                "Germany",
                "EUR"
        );

        when(supplierRepository.findAllByBusinessId(businessId))
                .thenReturn(List.of(supplier));

        List<SupplierResponse> suppliers =
                supplierService.getSuppliersByBusinessId(businessId);

        assertEquals(1, suppliers.size());
        assertEquals("TechSupply GmbH", suppliers.getFirst().name());

        verify(supplierRepository).findAllByBusinessId(businessId);
    }

    @Test
    void shouldReturnSupplierByIdForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();
        Business business = new Business("Aziz Electronics");

        Supplier supplier = new Supplier(
                business,
                "TechSupply GmbH",
                "contact@techsupply.de",
                "+49 511 123456",
                "Germany",
                "EUR"
        );

        when(supplierRepository.findByIdAndBusinessId(supplierId, businessId))
                .thenReturn(Optional.of(supplier));

        SupplierResponse response =
                supplierService.getSupplierById(businessId, supplierId);

        assertEquals("TechSupply GmbH", response.name());
        assertEquals("Germany", response.country());
        assertEquals("EUR", response.preferredCurrency());

        verify(supplierRepository)
                .findByIdAndBusinessId(supplierId, businessId);
    }

    @Test
    void shouldThrowExceptionWhenSupplierDoesNotExistForBusiness() {
        UUID businessId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();

        when(supplierRepository.findByIdAndBusinessId(supplierId, businessId))
                .thenReturn(Optional.empty());

        assertThrows(
                SupplierNotFoundException.class,
                () -> supplierService.getSupplierById(businessId, supplierId)
        );

        verify(supplierRepository)
                .findByIdAndBusinessId(supplierId, businessId);
    }
}
