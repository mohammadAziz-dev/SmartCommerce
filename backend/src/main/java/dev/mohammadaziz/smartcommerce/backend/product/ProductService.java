package dev.mohammadaziz.smartcommerce.backend.product;

import dev.mohammadaziz.smartcommerce.backend.business.Business;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessNotFoundException;
import dev.mohammadaziz.smartcommerce.backend.business.BusinessRepository;
import dev.mohammadaziz.smartcommerce.backend.product.dto.CreateProductRequest;
import dev.mohammadaziz.smartcommerce.backend.product.dto.ProductResponse;
import dev.mohammadaziz.smartcommerce.backend.product.dto.UpdateProductRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BusinessRepository businessRepository;

    public ProductService(
            ProductRepository productRepository,
            BusinessRepository businessRepository
    ) {
        this.productRepository = productRepository;
        this.businessRepository = businessRepository;
    }

    public ProductResponse createProduct(UUID businessId, CreateProductRequest request) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new BusinessNotFoundException(businessId));

        Product product = new Product(
                business,
                request.name(),
                request.description(),
                request.sku(),
                request.sellingPrice(),
                request.category(),
                request.active()
        );

        Product savedProduct = productRepository.save(product);

        return toResponse(savedProduct);
    }

    public List<ProductResponse> getProductsByBusinessId(UUID businessId) {
        return productRepository.findAllByBusinessId(businessId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getBusiness().getId(),
                product.getName(),
                product.getDescription(),
                product.getSku(),
                product.getSellingPrice(),
                product.getCategory(),
                product.isActive()
        );
    }

    public ProductResponse getProductById(UUID businessId, UUID productId) {
        Product product = productRepository
                .findByIdAndBusinessId(productId, businessId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        return toResponse(product);
    }

    public ProductResponse updateProduct(
            UUID businessId,
            UUID productId,
            UpdateProductRequest request
    ) {
        Product product = productRepository
                .findByIdAndBusinessId(productId, businessId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        product.update(
                request.name(),
                request.description(),
                request.sku(),
                request.sellingPrice(),
                request.category(),
                request.active()
        );

        Product savedProduct = productRepository.save(product);

        return toResponse(savedProduct);
    }

    public ProductResponse deactivateProduct(UUID businessId, UUID productId) {
        Product product = productRepository
                .findByIdAndBusinessId(productId, businessId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        product.deactivate();

        Product savedProduct = productRepository.save(product);

        return toResponse(savedProduct);
    }
}
