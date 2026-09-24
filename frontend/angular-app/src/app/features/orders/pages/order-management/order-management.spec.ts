import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { OrderApiService } from '../../../../core/api/order-api.service';
import { OrderManagement } from './order-management';

describe('OrderManagement', () => {
  let component: OrderManagement;
  let fixture: ComponentFixture<OrderManagement>;

  const orderApiMock = {
    getOrders: vi.fn().mockReturnValue(of([])),
  };

  const businessId = '1065f8b0-bf84-481f-9091-e0d387074e1e';

  const activatedRouteMock = {
    snapshot: {
      queryParamMap: {
        get: vi.fn().mockReturnValue(businessId),
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderManagement],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
        {
          provide: OrderApiService,
          useValue: orderApiMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderManagement);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders for the business from the query parameter', () => {
    const businessId = '1065f8b0-bf84-481f-9091-e0d387074e1e';

    window.history.pushState({}, '', `/orders?businessId=${businessId}`);

    fixture.detectChanges();

    expect(orderApiMock.getOrders).toHaveBeenCalledWith(businessId);
  });

  it('should load orders for the business from the query parameter', () => {
    fixture.detectChanges();

    expect(orderApiMock.getOrders).toHaveBeenCalledWith(businessId);
  });

  it('should store loaded orders', () => {
    const orders = [
      {
        id: 'order-1',
        businessId,
        status: 'CREATED' as const,
        totalPrice: 49.99,
        createdAt: '2026-09-24T12:00:00Z',
        items: [],
      },
    ];

    orderApiMock.getOrders.mockReturnValue(of(orders));

    fixture.detectChanges();

    expect(component.orders()).toEqual(orders);
  });

  it('should set an error when loading orders fails', () => {
    orderApiMock.getOrders.mockReturnValue(throwError(() => new Error('Request failed')));

    fixture.detectChanges();

    expect(component.loadError()).toBe('Could not load orders.');
  });
});
