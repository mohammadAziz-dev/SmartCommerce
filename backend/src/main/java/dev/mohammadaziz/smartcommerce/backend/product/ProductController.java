package dev.mohammadaziz.smartcommerce.backend.product;

import dev.mohammadaziz.smartcommerce.backend.product.dto.ProductResponse;
import dev.mohammadaziz.smartcommerce.backend.product.dto.CreateProductRequest;
import dev.mohammadaziz.smartcommerce.backend.product.dto.UpdateProductRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductResponse> getProducts(
            @PathVariable UUID businessId
    ) {
        return productService.getProductsByBusinessId(businessId);
    }

    @GetMapping("/{productId}")
    public ProductResponse getProductById(
            @PathVariable UUID businessId,
            @PathVariable UUID productId
    ) {
        return productService.getProductById(businessId, productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateProductRequest request
    ) {
        return productService.createProduct(businessId, request);
    }

    @PutMapping("/{productId}")
    public ProductResponse updateProduct(
            @PathVariable UUID businessId,
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        return productService.updateProduct(businessId, productId, request);
    }

    @PatchMapping("/{productId}/deactivate")
    public ProductResponse deactivateProduct(
            @PathVariable UUID businessId,
            @PathVariable UUID productId
    ) {
        return productService.deactivateProduct(businessId, productId);
    }
}