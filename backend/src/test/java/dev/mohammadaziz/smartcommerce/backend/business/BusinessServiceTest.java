package dev.mohammadaziz.smartcommerce.backend.business;

import dev.mohammadaziz.smartcommerce.backend.business.dto.BusinessResponse;
import dev.mohammadaziz.smartcommerce.backend.business.dto.CreateBusinessRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusinessServiceTest {

    @Mock
    private BusinessRepository businessRepository;

    @InjectMocks
    private BusinessService businessService;

    @Test
    void shouldCreateBusiness() {
        CreateBusinessRequest request =
                new CreateBusinessRequest("Aziz Electronics");

        Business savedBusiness = new Business("Aziz Electronics");

        when(businessRepository.save(any(Business.class)))
                .thenReturn(savedBusiness);

        BusinessResponse response =
                businessService.createBusiness(request);

        assertEquals("Aziz Electronics", response.name());

        verify(businessRepository).save(any(Business.class));
    }

    @Test
    void shouldReturnBusinessById() {
        UUID id = UUID.randomUUID();
        Business business = new Business("Aziz Electronics");

        when(businessRepository.findById(id))
                .thenReturn(Optional.of(business));

        BusinessResponse response =
                businessService.getBusinessById(id);

        assertEquals("Aziz Electronics", response.name());

        verify(businessRepository).findById(id);
    }

    @Test
    void shouldThrowExceptionWhenBusinessNotFound() {
        UUID id = UUID.randomUUID();

        when(businessRepository.findById(id))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessNotFoundException.class,
                () -> businessService.getBusinessById(id)
        );

        verify(businessRepository).findById(id);
    }
}