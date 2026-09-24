import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Order } from '../../models/order.model';
import { OrderApiService } from './order-api.service';

describe('OrderApiService', () => {
  let service: OrderApiService;
  let httpTesting: HttpTestingController;

  const businessId = 'business-123';

  const order: Order = {
    id: 'order-123',
    businessId,
    status: 'CREATED',
    totalPrice: 59.98,
    createdAt: '2026-09-24T12:00:00Z',
    items: [
      {
        productId: 'product-123',
        productName: 'Wireless Mouse',
        quantity: 2,
        unitPrice: 29.99,
        subtotal: 59.98,
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OrderApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should load orders for a business', () => {
    service.getOrders(businessId).subscribe((orders) => {
      expect(orders).toEqual([order]);
    });

    const request = httpTesting.expectOne(`/api/businesses/${businessId}/orders`);

    expect(request.request.method).toBe('GET');

    request.flush([order]);
  });

  it('should load an order by id', () => {
    service.getOrder(businessId, order.id).subscribe((result) => {
      expect(result).toEqual(order);
    });

    const request = httpTesting.expectOne(`/api/businesses/${businessId}/orders/${order.id}`);

    expect(request.request.method).toBe('GET');

    request.flush(order);
  });
});
