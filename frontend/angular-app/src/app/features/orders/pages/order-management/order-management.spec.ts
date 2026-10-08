import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';

import {OrderApiService} from '../../../../core/api/order-api.service';
import {BusinessContextService} from '../../../../core/services/business-context.service';
import {OrderManagement} from './order-management';

describe('OrderManagement', () => {
  let component: OrderManagement;
  let fixture: ComponentFixture<OrderManagement>;

  const orderApiMock = {
    getOrders: vi.fn().mockReturnValue(of([])),
  };

  const businessId = '1065f8b0-bf84-481f-9091-e0d387074e1e';

  beforeEach(async () => {
    vi.resetAllMocks();
    orderApiMock.getOrders.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [OrderManagement],
      providers: [
        provideRouter([]),
        {
          provide: OrderApiService,
          useValue: orderApiMock,
        },
      ],
    }).compileComponents();

    const businessContext = TestBed.inject(BusinessContextService);
    businessContext.selectBusiness({
      id: businessId,
      name: 'Test Business',
    });

    fixture = TestBed.createComponent(OrderManagement);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders for the selected business', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(orderApiMock.getOrders).toHaveBeenCalledWith(businessId);
  });

  it('should store loaded orders', async () => {
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
    await fixture.whenStable();

    expect(component.orders()).toEqual(orders);
  });

  it('should set an error when loading orders fails', async () => {
    orderApiMock.getOrders.mockReturnValue(throwError(() => new Error('Request failed')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.loadError()).toBe('Could not load orders.');
  });
  it('should reload orders when the selected business changes', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const anotherBusinessId = 'business-456';
    const businessContext = TestBed.inject(BusinessContextService);
    businessContext.selectBusiness({
      id: anotherBusinessId,
      name: 'Another Business',
    });
    await fixture.whenStable();

    expect(orderApiMock.getOrders).toHaveBeenCalledWith(anotherBusinessId);
    expect(orderApiMock.getOrders).toHaveBeenCalledTimes(2);
  });

});
