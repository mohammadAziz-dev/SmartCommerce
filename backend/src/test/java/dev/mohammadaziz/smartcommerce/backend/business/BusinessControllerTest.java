package dev.mohammadaziz.smartcommerce.backend.business;

import dev.mohammadaziz.smartcommerce.backend.business.dto.BusinessResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BusinessController.class)
class BusinessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BusinessService businessService;

    @Test
    void shouldCreateBusiness() throws Exception {
        UUID id = UUID.randomUUID();

        when(businessService.createBusiness(
                new dev.mohammadaziz.smartcommerce.backend.business.dto.CreateBusinessRequest(
                        "Aziz Electronics"
                )
        )).thenReturn(new BusinessResponse(id, "Aziz Electronics"));

        mockMvc.perform(post("/api/businesses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Aziz Electronics"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Aziz Electronics"));
    }

    @Test
    void shouldRejectBlankBusinessName() throws Exception {
        mockMvc.perform(post("/api/businesses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": ""
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnBusinessById() throws Exception {
        UUID id = UUID.randomUUID();

        when(businessService.getBusinessById(id))
                .thenReturn(new BusinessResponse(id, "Aziz Electronics"));

        mockMvc.perform(get("/api/businesses/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Aziz Electronics"));
    }

    @Test
    void shouldReturn404WhenBusinessNotFound() throws Exception {
        UUID id = UUID.randomUUID();

        when(businessService.getBusinessById(id))
                .thenThrow(new BusinessNotFoundException(id));

        mockMvc.perform(get("/api/businesses/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnAllBusinesses() throws Exception {
        UUID firstId = UUID.randomUUID();
        UUID secondId = UUID.randomUUID();

        when(businessService.getBusinesses()).thenReturn(List.of(
                new BusinessResponse(firstId, "SmartOffice Store"),
                new BusinessResponse(secondId, "Aziz Electronics")
        ));

        mockMvc.perform(get("/api/businesses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(firstId.toString()))
                .andExpect(jsonPath("$[0].name").value("SmartOffice Store"))
                .andExpect(jsonPath("$[1].id").value(secondId.toString()))
                .andExpect(jsonPath("$[1].name").value("Aziz Electronics"));
    }
}