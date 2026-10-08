import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {BehaviorSubject, of, throwError} from 'rxjs';

import {OrderApiService} from '../../../../core/api/order-api.service';
import {BusinessContextService} from '../../../../core/services/business-context.service';
import {OrderDetail} from './order-detail';

describe('OrderDetail', () => {
  let component: OrderDetail;
  let fixture: ComponentFixture<OrderDetail>;
  let businessContext: BusinessContextService;
  let routeParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const businessId = 'business-1';
  const orderId = 'order-1';

  const orderApiMock = {
    getOrder: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    orderApiMock.getOrder.mockReturnValue(of(null));
    routeParams = new BehaviorSubject(convertToParamMap({orderId}));

    await TestBed.configureTestingModule({
      imports: [OrderDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {paramMap: routeParams.asObservable()},
        },
        {
          provide: OrderApiService,
          useValue: orderApiMock,
        },
      ],
    }).compileComponents();

    businessContext = TestBed.inject(BusinessContextService);
    businessContext.selectBusiness({id: businessId, name: 'Test Business'});

    fixture = TestBed.createComponent(OrderDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the order for the selected business and order id', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(orderApiMock.getOrder).toHaveBeenCalledWith(businessId, orderId);
  });

  it('should store the loaded order', async () => {
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
    await fixture.whenStable();

    expect(component.order()).toEqual(order);
  });

  it('should set an error when loading the order fails', async () => {
    orderApiMock.getOrder.mockReturnValue(
      throwError(() => new Error('Request failed')),
    );

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.loadError()).toBe('Could not load order.');
  });

  it('should reload the order when the business changes', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    businessContext.selectBusiness({id: 'business-2', name: 'Other Business'});
    await fixture.whenStable();

    expect(orderApiMock.getOrder).toHaveBeenCalledWith('business-2', orderId);
    expect(orderApiMock.getOrder).toHaveBeenCalledTimes(2);
  });

  it('should reload when the order id changes', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    routeParams.next(convertToParamMap({orderId: 'order-2'}));
    await fixture.whenStable();

    expect(orderApiMock.getOrder).toHaveBeenCalledWith(businessId, 'order-2');
  });
});
