import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {
  CreateInventoryRequest,
  Inventory,
  StockAdjustmentRequest,
} from '../../models/inventory.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventoryApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  createInventory(
    businessId: string,
    request: CreateInventoryRequest,
  ): Observable<Inventory> {
    return this.http.post<Inventory>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/inventory`,
      request,
    );
  }

  getInventory(
    businessId: string,
    productId: string,
  ): Observable<Inventory> {
    return this.http.get<Inventory>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/inventory/${productId}`,
    );
  }

  increaseStock(
    businessId: string,
    productId: string,
    request: StockAdjustmentRequest,
  ): Observable<Inventory> {
    return this.http.patch<Inventory>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/inventory/${productId}/increase`,
      request,
    );
  }

  decreaseStock(
    businessId: string,
    productId: string,
    request: StockAdjustmentRequest,
  ): Observable<Inventory> {
    return this.http.patch<Inventory>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/inventory/${productId}/decrease`,
      request,
    );
  }
}
