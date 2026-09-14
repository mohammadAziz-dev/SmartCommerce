package dev.mohammadaziz.smartcommerce.backend.business;

import dev.mohammadaziz.smartcommerce.backend.business.dto.BusinessResponse;
import dev.mohammadaziz.smartcommerce.backend.business.dto.CreateBusinessRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BusinessResponse createBusiness(
            @Valid @RequestBody CreateBusinessRequest request
    ) {
        return businessService.createBusiness(request);
    }

    @GetMapping("/{id}")
    public BusinessResponse getBusinessById(@PathVariable UUID id) {
        return businessService.getBusinessById(id);
    }
}