import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product, ProductRequest } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private readonly http = inject(HttpClient);

  getProducts(businessId: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `/api/businesses/${businessId}/products`,
    );
  }

  getProduct(businessId: string, productId: string): Observable<Product> {
    return this.http.get<Product>(
      `/api/businesses/${businessId}/products/${productId}`,
    );
  }

  createProduct(
    businessId: string,
    request: ProductRequest,
  ): Observable<Product> {
    return this.http.post<Product>(
      `/api/businesses/${businessId}/products`,
      request,
    );
  }

  updateProduct(
    businessId: string,
    productId: string,
    request: ProductRequest,
  ): Observable<Product> {
    return this.http.put<Product>(
      `/api/businesses/${businessId}/products/${productId}`,
      request,
    );
  }

  deactivateProduct(
    businessId: string,
    productId: string,
  ): Observable<Product> {
    return this.http.patch<Product>(
      `/api/businesses/${businessId}/products/${productId}/deactivate`,
      {},
    );
  }
}
