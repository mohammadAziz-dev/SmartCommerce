import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { InventoryApiService } from './inventory-api.service';
import {
  CreateInventoryRequest,
  Inventory,
  StockAdjustmentRequest,
} from '../../models/inventory.model';

describe('InventoryApiService', () => {
  let service: InventoryApiService;
  let httpTesting: HttpTestingController;

  const businessId = 'business-123';
  const productId = 'product-123';

  const inventory: Inventory = {
    id: 'inventory-123',
    businessId,
    productId,
    quantity: 20,
    lowStockThreshold: 5,
    lowStock: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InventoryApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(InventoryApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create inventory', () => {
    const requestBody: CreateInventoryRequest = {
      productId,
      quantity: 20,
      lowStockThreshold: 5,
    };

    service
      .createInventory(businessId, requestBody)
      .subscribe((result) => {
        expect(result).toEqual(inventory);
      });

    const request = httpTesting.expectOne(
      `/api/businesses/${businessId}/inventory`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(requestBody);

    request.flush(inventory);
  });

  it('should load inventory for a product', () => {
    service
      .getInventory(businessId, productId)
      .subscribe((result) => {
        expect(result).toEqual(inventory);
      });

    const request = httpTesting.expectOne(
      `/api/businesses/${businessId}/inventory/${productId}`,
    );

    expect(request.request.method).toBe('GET');

    request.flush(inventory);
  });

  it('should increase stock', () => {
    const requestBody: StockAdjustmentRequest = {
      amount: 5,
    };

    const updatedInventory: Inventory = {
      ...inventory,
      quantity: 25,
    };

    service
      .increaseStock(businessId, productId, requestBody)
      .subscribe((result) => {
        expect(result).toEqual(updatedInventory);
      });

    const request = httpTesting.expectOne(
      `/api/businesses/${businessId}/inventory/${productId}/increase`,
    );

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(requestBody);

    request.flush(updatedInventory);
  });

  it('should decrease stock', () => {
    const requestBody: StockAdjustmentRequest = {
      amount: 5,
    };

    const updatedInventory: Inventory = {
      ...inventory,
      quantity: 15,
    };

    service
      .decreaseStock(businessId, productId, requestBody)
      .subscribe((result) => {
        expect(result).toEqual(updatedInventory);
      });

    const request = httpTesting.expectOne(
      `/api/businesses/${businessId}/inventory/${productId}/decrease`,
    );

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(requestBody);

    request.flush(updatedInventory);
  });
});
