package dev.mohammadaziz.smartcommerce.backend.supplier;

import dev.mohammadaziz.smartcommerce.backend.supplier.dto.CreateSupplierRequest;
import dev.mohammadaziz.smartcommerce.backend.supplier.dto.SupplierResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SupplierController.class)
class SupplierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SupplierService supplierService;

    @Test
    void shouldReturnSuppliersForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();

        SupplierResponse supplier = new SupplierResponse(
                UUID.randomUUID(),
                businessId,
                "TechSupply GmbH",
                "contact@techsupply.de",
                "+49 511 123456",
                "Germany",
                "EUR"
        );

        when(supplierService.getSuppliersByBusinessId(businessId))
                .thenReturn(List.of(supplier));

        mockMvc.perform(
                        get("/api/businesses/{businessId}/suppliers", businessId)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("TechSupply GmbH"))
                .andExpect(jsonPath("$[0].email").value("contact@techsupply.de"))
                .andExpect(jsonPath("$[0].country").value("Germany"))
                .andExpect(jsonPath("$[0].preferredCurrency").value("EUR"));
    }

    @Test
    void shouldReturnSupplierByIdForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();

        SupplierResponse supplier = new SupplierResponse(
                supplierId,
                businessId,
                "TechSupply GmbH",
                "contact@techsupply.de",
                "+49 511 123456",
                "Germany",
                "EUR"
        );

        when(supplierService.getSupplierById(businessId, supplierId))
                .thenReturn(supplier);

        mockMvc.perform(
                        get(
                                "/api/businesses/{businessId}/suppliers/{supplierId}",
                                businessId,
                                supplierId
                        )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(supplierId.toString()))
                .andExpect(jsonPath("$.businessId").value(businessId.toString()))
                .andExpect(jsonPath("$.name").value("TechSupply GmbH"));
    }

    @Test
    void shouldCreateSupplierForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();

        SupplierResponse response = new SupplierResponse(
                supplierId,
                businessId,
                "TechSupply GmbH",
                "contact@techsupply.de",
                "+49 511 123456",
                "Germany",
                "EUR"
        );

        when(supplierService.createSupplier(
                eq(businessId),
                any(CreateSupplierRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                        post("/api/businesses/{businessId}/suppliers", businessId)
                                .contentType("application/json")
                                .content("""
                                    {
                                      "name": "TechSupply GmbH",
                                      "email": "contact@techsupply.de",
                                      "phone": "+49 511 123456",
                                      "country": "Germany",
                                      "preferredCurrency": "EUR"
                                    }
                                    """)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(supplierId.toString()))
                .andExpect(jsonPath("$.businessId").value(businessId.toString()))
                .andExpect(jsonPath("$.name").value("TechSupply GmbH"))
                .andExpect(jsonPath("$.preferredCurrency").value("EUR"));
    }

    @Test
    void shouldReturnBadRequestWhenSupplierNameIsBlank() throws Exception {
        UUID businessId = UUID.randomUUID();

        mockMvc.perform(
                        post("/api/businesses/{businessId}/suppliers", businessId)
                                .contentType("application/json")
                                .content("""
                                    {
                                      "name": "",
                                      "email": "contact@techsupply.de",
                                      "country": "Germany",
                                      "preferredCurrency": "EUR"
                                    }
                                    """)
                )
                .andExpect(status().isBadRequest());

        verify(supplierService, never())
                .createSupplier(eq(businessId), any(CreateSupplierRequest.class));
    }

    @Test
    void shouldReturnBadRequestWhenSupplierEmailIsInvalid() throws Exception {
        UUID businessId = UUID.randomUUID();

        mockMvc.perform(
                        post("/api/businesses/{businessId}/suppliers", businessId)
                                .contentType("application/json")
                                .content("""
                                    {
                                      "name": "TechSupply GmbH",
                                      "email": "not-an-email",
                                      "country": "Germany",
                                      "preferredCurrency": "EUR"
                                    }
                                    """)
                )
                .andExpect(status().isBadRequest());

        verify(supplierService, never())
                .createSupplier(eq(businessId), any(CreateSupplierRequest.class));
    }

    @Test
    void shouldReturnNotFoundWhenSupplierDoesNotExistForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();

        when(supplierService.getSupplierById(businessId, supplierId))
                .thenThrow(new SupplierNotFoundException(supplierId));

        mockMvc.perform(
                        get(
                                "/api/businesses/{businessId}/suppliers/{supplierId}",
                                businessId,
                                supplierId
                        )
                )
                .andExpect(status().isNotFound());
    }
}
