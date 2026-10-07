import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {of, throwError} from 'rxjs';

import {InventoryManagement} from './inventory-management';
import {InventoryApiService} from '../../../../core/api/inventory-api.service';
import {ProductApiService} from '../../../../core/api/product-api.service';
import {Inventory} from '../../../../models/inventory.model';
import {Product} from '../../../../models/product.model';

describe('InventoryManagement', () => {
  let fixture: ComponentFixture<InventoryManagement>;
  let component: InventoryManagement;

  const businessId = 'business-123';

  const product: Product = {
    id: 'product-123',
    businessId,
    name: 'Wireless Mouse',
    description: 'Test mouse',
    sku: 'MOUSE-001',
    sellingPrice: 29.99,
    category: 'Electronics',
    active: true,
  };

  const inventory: Inventory = {
    id: 'inventory-123',
    businessId,
    productId: product.id,
    quantity: 20,
    lowStockThreshold: 5,
    lowStock: false,
  };

  const productApiMock = {
    getProducts: vi.fn().mockReturnValue(of([product])),
  };

  const inventoryApiMock = {
    getInventories: vi.fn().mockReturnValue(of([inventory])),
    createInventory: vi.fn(),
    increaseStock: vi.fn(),
    decreaseStock: vi.fn(),
    subscribeToInventoryChanges: vi.fn().mockReturnValue({
      close: vi.fn(),
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [InventoryManagement],
      providers: [
        {
          provide: ProductApiService,
          useValue: productApiMock,
        },
        {
          provide: InventoryApiService,
          useValue: inventoryApiMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: vi.fn().mockReturnValue(businessId),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load products and inventories', () => {
    expect(productApiMock.getProducts).toHaveBeenCalledWith(businessId);
    expect(inventoryApiMock.getInventories).toHaveBeenCalledWith(businessId);

    expect(component.products()).toEqual([product]);
    expect(component.inventories()).toEqual([inventory]);
  });

  it('should combine products with their inventory', () => {
    expect(component.inventoryRows()).toEqual([
      {
        product,
        inventory,
      },
    ]);
  });

  it('should increase stock after confirmation', () => {
    const updatedInventory: Inventory = {
      ...inventory,
      quantity: 25,
    };

    inventoryApiMock.increaseStock.mockReturnValue(of(updatedInventory));

    component.selectProduct(product.id);
    component.stockAdjustmentForm.setValue({
      amount: 5,
    });

    component.requestStockIncrease();

    expect(component.pendingStockIncrease()).toBe(5);

    component.confirmStockIncrease();

    expect(inventoryApiMock.increaseStock).toHaveBeenCalledWith(
      businessId,
      product.id,
      {amount: 5},
    );

    expect(component.inventories()[0].quantity).toBe(25);
    expect(component.pendingStockIncrease()).toBeNull();
  });

  it('should decrease stock after confirmation', () => {
    const updatedInventory: Inventory = {
      ...inventory,
      quantity: 15,
    };

    inventoryApiMock.decreaseStock.mockReturnValue(of(updatedInventory));

    component.selectProduct(product.id);
    component.stockAdjustmentForm.setValue({
      amount: 5,
    });

    component.requestStockDecrease();

    expect(component.pendingStockDecrease()).toBe(5);

    component.confirmStockDecrease();

    expect(inventoryApiMock.decreaseStock).toHaveBeenCalledWith(
      businessId,
      product.id,
      {amount: 5},
    );

    expect(component.inventories()[0].quantity).toBe(15);
    expect(component.pendingStockDecrease()).toBeNull();
  });

  it('should create inventory after confirmation', () => {
    const productWithoutInventory: Product = {
      ...product,
      id: 'product-456',
      name: 'Keyboard',
    };

    const createdInventory: Inventory = {
      id: 'inventory-456',
      businessId,
      productId: productWithoutInventory.id,
      quantity: 10,
      lowStockThreshold: 3,
      lowStock: false,
    };

    component.products.set([product, productWithoutInventory]);

    inventoryApiMock.createInventory.mockReturnValue(of(createdInventory));

    component.selectProduct(productWithoutInventory.id);

    component.inventoryForm.setValue({
      quantity: 10,
      lowStockThreshold: 3,
    });

    component.requestInventoryCreation();

    expect(component.pendingInventoryCreation()).toEqual({
      quantity: 10,
      lowStockThreshold: 3,
    });

    component.confirmInventoryCreation();

    expect(inventoryApiMock.createInventory).toHaveBeenCalledWith(
      businessId,
      {
        productId: productWithoutInventory.id,
        quantity: 10,
        lowStockThreshold: 3,
      },
    );

    expect(component.inventories()).toContainEqual(createdInventory);
    expect(component.pendingInventoryCreation()).toBeNull();
  });

  it('should update inventory when an SSE event is received', () => {
    const callback =
      inventoryApiMock.subscribeToInventoryChanges.mock.calls[0][1];

    callback({
      businessId,
      productId: product.id,
      quantity: 3,
    });

    const updatedInventory = component.inventories()[0];

    expect(updatedInventory.quantity).toBe(3);
    expect(updatedInventory.lowStock).toBe(true);
  });

  it('should return no selected inventory when no product is selected', () => {
    expect(component.selectedInventory()).toBeNull();
  });

  it('should cancel pending inventory actions', () => {
    component.pendingStockIncrease.set(5);
    component.pendingStockDecrease.set(5);
    component.pendingInventoryCreation.set({
      quantity: 10,
      lowStockThreshold: 3,
    });

    component.cancelStockIncrease();
    component.cancelStockDecrease();
    component.cancelInventoryCreation();

    expect(component.pendingStockIncrease()).toBeNull();
    expect(component.pendingStockDecrease()).toBeNull();
    expect(component.pendingInventoryCreation()).toBeNull();
  });

  it('should not request stock adjustment when the form is invalid', () => {
    component.stockAdjustmentForm.controls.amount.setValue(0);

    component.requestStockIncrease();
    component.requestStockDecrease();

    expect(component.pendingStockIncrease()).toBeNull();
    expect(component.pendingStockDecrease()).toBeNull();
    expect(component.stockAdjustmentForm.touched).toBe(true);
  });

  it('should not request inventory creation when the form is invalid', () => {
    component.inventoryForm.setValue({
      quantity: -1,
      lowStockThreshold: -1,
    });

    component.requestInventoryCreation();

    expect(component.pendingInventoryCreation()).toBeNull();
    expect(component.inventoryForm.touched).toBe(true);
  });

  it('should show an error when decreasing more stock than available', () => {
    inventoryApiMock.decreaseStock.mockReturnValue(
      throwError(() => ({status: 400})),
    );

    component.selectProduct(product.id);
    component.stockAdjustmentForm.setValue({
      amount: 100,
    });

    component.decreaseStock();

    expect(component.inventoryActionError()).toBe(
      'Not enough stock available.',
    );
  });

  it('should show an error when increasing stock fails', () => {
    inventoryApiMock.increaseStock.mockReturnValue(
      throwError(() => ({status: 500})),
    );

    component.selectProduct(product.id);
    component.stockAdjustmentForm.setValue({
      amount: 5,
    });

    component.increaseStock();

    expect(component.inventoryActionError()).toBe(
      'Could not increase stock. Please try again.',
    );
  });
});
