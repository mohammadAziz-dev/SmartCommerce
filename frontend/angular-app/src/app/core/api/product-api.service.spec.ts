import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ProductApiService } from './product-api.service';
import { Product, ProductRequest } from '../../models/product.model';

describe('ProductApiService', () => {
  let service: ProductApiService;
  let httpTesting: HttpTestingController;

  const businessId = 'business-123';

  const product: Product = {
    id: 'product-123',
    businessId,
    name: 'Gaming Mouse',
    description: 'Wireless gaming mouse',
    sku: 'MOUSE-001',
    sellingPrice: 39.99,
    category: 'Gaming',
    active: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProductApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should load products for a business', () => {
    service.getProducts(businessId).subscribe((products) => {
      expect(products).toEqual([product]);
    });

    const request = httpTesting.expectOne(
      `/api/businesses/${businessId}/products`,
    );

    expect(request.request.method).toBe('GET');

    request.flush([product]);
  });

  it('should create a product', () => {
    const productRequest: ProductRequest = {
      name: 'Gaming Mouse',
      description: 'Wireless gaming mouse',
      sku: 'MOUSE-001',
      sellingPrice: 39.99,
      category: 'Gaming',
      active: true,
    };

    service
      .createProduct(businessId, productRequest)
      .subscribe((createdProduct) => {
        expect(createdProduct).toEqual(product);
      });

    const request = httpTesting.expectOne(
      `/api/businesses/${businessId}/products`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(productRequest);

    request.flush(product);
  });

  it('should load a product by id', () => {
    service.getProduct(businessId, product.id).subscribe((result) => {
      expect(result).toEqual(product);
    });

    const request = httpTesting.expectOne(
      `/api/businesses/${businessId}/products/${product.id}`,
    );

    expect(request.request.method).toBe('GET');

    request.flush(product);
  });

  it('should update a product', () => {
    const productRequest: ProductRequest = {
      name: 'Updated Gaming Mouse',
      description: 'Updated description',
      sku: 'MOUSE-001',
      sellingPrice: 49.99,
      category: 'Gaming',
      active: true,
    };

    const updatedProduct: Product = {
      ...product,
      ...productRequest,
    };

    service
      .updateProduct(businessId, product.id, productRequest)
      .subscribe((result) => {
        expect(result).toEqual(updatedProduct);
      });

    const request = httpTesting.expectOne(
      `/api/businesses/${businessId}/products/${product.id}`,
    );

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(productRequest);

    request.flush(updatedProduct);
  });

  it('should deactivate a product', () => {
    const deactivatedProduct: Product = {
      ...product,
      active: false,
    };

    service
      .deactivateProduct(businessId, product.id)
      .subscribe((result) => {
        expect(result).toEqual(deactivatedProduct);
      });

    const request = httpTesting.expectOne(
      `/api/businesses/${businessId}/products/${product.id}/deactivate`,
    );

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush(deactivatedProduct);
  });
});
