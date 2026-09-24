import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { OrderApiService } from '../../../../core/api/order-api.service';
import { OrderDetail } from './order-detail';

describe('OrderDetail', () => {
  let component: OrderDetail;
  let fixture: ComponentFixture<OrderDetail>;

  const businessId = 'business-1';
  const orderId = 'order-1';

  const orderApiMock = {
    getOrder: vi.fn().mockReturnValue(of(null)),
  };

  const activatedRouteMock = {
    snapshot: {
      queryParamMap: {
        get: vi.fn().mockReturnValue(businessId),
      },
      paramMap: {
        get: vi.fn().mockReturnValue(orderId),
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetail],
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

    fixture = TestBed.createComponent(OrderDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the order for the business and order id', () => {
    fixture.detectChanges();

    expect(orderApiMock.getOrder).toHaveBeenCalledWith(businessId, orderId);
  });

  it('should store the loaded order', () => {
    const order = {
      id: orderId,
      businessId,
      status: 'CREATED' as const,
      totalPrice: 49.99,
      createdAt: '2026-09-24T12:00:00Z',
      items: [
        {
          productId: 'product-1',
          productName: 'Wireless Mouse',
          quantity: 2,
          unitPrice: 24.995,
          subtotal: 49.99,
        },
      ],
    };

    orderApiMock.getOrder.mockReturnValue(of(order));

    fixture.detectChanges();

    expect(component.order()).toEqual(order);
  });

  it('should set an error when loading the order fails', () => {
    orderApiMock.getOrder.mockReturnValue(throwError(() => new Error('Request failed')));

    fixture.detectChanges();

    expect(component.loadError()).toBe('Could not load order.');
  });
});
