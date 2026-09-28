import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {Product, ProductRequest} from '../../models/product.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  getProducts(businessId: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/products`,
    );
  }

  getProduct(businessId: string, productId: string): Observable<Product> {
    return this.http.get<Product>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/products/${productId}`,
    );
  }

  createProduct(
    businessId: string,
    request: ProductRequest,
  ): Observable<Product> {
    return this.http.post<Product>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/products`,
      request,
    );
  }

  updateProduct(
    businessId: string,
    productId: string,
    request: ProductRequest,
  ): Observable<Product> {
    return this.http.put<Product>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/products/${productId}`,
      request,
    );
  }

  deactivateProduct(
    businessId: string,
    productId: string,
  ): Observable<Product> {
    return this.http.patch<Product>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/products/${productId}/deactivate`,
      {},
    );
  }
}
