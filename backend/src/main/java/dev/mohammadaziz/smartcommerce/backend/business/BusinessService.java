package dev.mohammadaziz.smartcommerce.backend.business;

import dev.mohammadaziz.smartcommerce.backend.business.dto.BusinessResponse;
import dev.mohammadaziz.smartcommerce.backend.business.dto.CreateBusinessRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;

    public BusinessService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    public BusinessResponse createBusiness(CreateBusinessRequest request) {
        Business business = new Business(request.name());
        Business savedBusiness = businessRepository.save(business);

        return new BusinessResponse(
                savedBusiness.getId(),
                savedBusiness.getName()
        );
    }

    public BusinessResponse getBusinessById(UUID id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new BusinessNotFoundException(id));

        return new BusinessResponse(
                business.getId(),
                business.getName()
        );
    }
}