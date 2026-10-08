package dev.mohammadaziz.smartcommerce.backend.inventory;

import dev.mohammadaziz.smartcommerce.backend.inventory.dto.InventoryResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InventoryController.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InventoryService inventoryService;

    @Test
    void shouldReturnInventoriesForBusiness() throws Exception {
        UUID businessId = UUID.randomUUID();
        UUID inventoryId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        InventoryResponse inventory = new InventoryResponse(
                inventoryId,
                businessId,
                productId,
                20,
                5,
                false
        );

        when(inventoryService.getInventories(businessId))
                .thenReturn(List.of(inventory));

        mockMvc.perform(
                        get("/api/businesses/{businessId}/inventory", businessId)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(inventoryId.toString()))
                .andExpect(jsonPath("$[0].businessId").value(businessId.toString()))
                .andExpect(jsonPath("$[0].productId").value(productId.toString()))
                .andExpect(jsonPath("$[0].quantity").value(20))
                .andExpect(jsonPath("$[0].lowStockThreshold").value(5))
                .andExpect(jsonPath("$[0].lowStock").value(false));
    }
}