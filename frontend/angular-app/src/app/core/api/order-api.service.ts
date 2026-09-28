import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {Order} from '../../models/order.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  getOrders(businessId: string): Observable<Order[]> {
    return this.http.get<Order[]>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/orders`,
    );
  }

  getOrder(businessId: string, orderId: string): Observable<Order> {
    return this.http.get<Order>(
      `${this.apiBaseUrl}/api/businesses/${businessId}/orders/${orderId}`,
    );
  }
}
