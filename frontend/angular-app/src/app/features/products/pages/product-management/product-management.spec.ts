import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductManagement } from './product-management';
import { ProductApiService } from '../../../../core/api/product-api.service';
import { InventoryApiService } from '../../../../core/api/inventory-api.service';

describe('ProductManagement', () => {
  let component: ProductManagement;
  let fixture: ComponentFixture<ProductManagement>;

  const productApiMock = {
    getProducts: vi.fn().mockReturnValue(of([])),
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deactivateProduct: vi.fn(),
  };

  const inventoryApiMock = {
    createInventory: vi.fn(),
    getInventory: vi.fn(),
    increaseStock: vi.fn(),
    decreaseStock: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductManagement],
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
                get: vi.fn().mockReturnValue('business-123'),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductManagement);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on initialization', () => {
    expect(productApiMock.getProducts).toHaveBeenCalledWith(
      'business-123',
    );

    expect(component.businessId()).toBe('business-123');
    expect(component.products()).toEqual([]);
  });

  it('should create a product and add it to the product list', () => {
    const createdProduct = {
      id: 'product-123',
      businessId: 'business-123',
      name: 'USB-C Hub',
      description: '7-in-1 USB-C Hub',
      sku: 'HUB-001',
      sellingPrice: 49.99,
      category: 'Accessories',
      active: true,
    };

    productApiMock.createProduct.mockReturnValue(
      of(createdProduct),
    );

    component.productForm.setValue({
      name: 'USB-C Hub',
      description: '7-in-1 USB-C Hub',
      sku: 'HUB-001',
      sellingPrice: 49.99,
      category: 'Accessories',
      active: true,
    });

    component.submitProduct();

    expect(productApiMock.createProduct).toHaveBeenCalledWith(
      'business-123',
      {
        name: 'USB-C Hub',
        description: '7-in-1 USB-C Hub',
        sku: 'HUB-001',
        sellingPrice: 49.99,
        category: 'Accessories',
        active: true,
      },
    );

    expect(component.products()).toEqual([createdProduct]);
    expect(component.productForm.controls.name.value).toBe('');
  });

  it('should update an existing product', () => {
    const existingProduct = {
      id: 'product-123',
      businessId: 'business-123',
      name: 'USB-C Hub',
      description: 'Old description',
      sku: 'HUB-001',
      sellingPrice: 49.99,
      category: 'Accessories',
      active: true,
    };

    const updatedProduct = {
      ...existingProduct,
      name: 'Premium USB-C Hub',
      sellingPrice: 59.99,
    };

    component.products.set([existingProduct]);

    component.editProduct(existingProduct);

    component.productForm.patchValue({
      name: 'Premium USB-C Hub',
      sellingPrice: 59.99,
    });

    productApiMock.updateProduct.mockReturnValue(
      of(updatedProduct),
    );

    component.submitProduct();

    expect(productApiMock.updateProduct).toHaveBeenCalledWith(
      'business-123',
      'product-123',
      {
        name: 'Premium USB-C Hub',
        description: 'Old description',
        sku: 'HUB-001',
        sellingPrice: 59.99,
        category: 'Accessories',
        active: true,
      },
    );

    expect(component.products()).toEqual([updatedProduct]);
    expect(component.editingProductId()).toBeNull();
    expect(component.productForm.controls.name.value).toBe('');
  });

  it('should deactivate a product and update the product list', () => {
    const activeProduct = {
      id: 'product-123',
      businessId: 'business-123',
      name: 'USB-C Hub',
      description: '7-in-1 USB-C Hub',
      sku: 'HUB-001',
      sellingPrice: 49.99,
      category: 'Accessories',
      active: true,
    };

    const deactivatedProduct = {
      ...activeProduct,
      active: false,
    };

    component.products.set([activeProduct]);

    productApiMock.deactivateProduct.mockReturnValue(
      of(deactivatedProduct),
    );

    component.deactivateProduct(activeProduct.id);

    expect(productApiMock.deactivateProduct).toHaveBeenCalledWith(
      'business-123',
      'product-123',
    );

    expect(component.products()).toEqual([deactivatedProduct]);
    expect(component.products()[0].active).toBe(false);
  });

  it('should load inventory when a product is selected', () => {
    const inventory = {
      id: 'inventory-123',
      businessId: 'business-123',
      productId: 'product-123',
      quantity: 20,
      lowStockThreshold: 5,
      lowStock: false,
    };

    inventoryApiMock.getInventory.mockReturnValue(
      of(inventory),
    );

    component.selectProduct('product-123');

    expect(component.selectedProductId()).toBe('product-123');

    expect(inventoryApiMock.getInventory).toHaveBeenCalledWith(
      'business-123',
      'product-123',
    );

    expect(component.inventory()).toEqual(inventory);
    expect(component.inventoryNotFound()).toBe(false);
    expect(component.inventoryError()).toBeNull();
  });

  it('should show inventory not found when the API returns 404', () => {
    inventoryApiMock.getInventory.mockReturnValue(
      throwError(() => ({
        status: 404,
      })),
    );

    component.selectProduct('product-123');

    expect(inventoryApiMock.getInventory).toHaveBeenCalledWith(
      'business-123',
      'product-123',
    );

    expect(component.inventory()).toBeNull();
    expect(component.inventoryNotFound()).toBe(true);
    expect(component.inventoryError()).toBe(
      'No inventory found for this product.',
    );
  });

  it('should create inventory for the selected product', () => {
    const createdInventory = {
      id: 'inventory-123',
      businessId: 'business-123',
      productId: 'product-123',
      quantity: 20,
      lowStockThreshold: 5,
      lowStock: false,
    };

    component.selectedProductId.set('product-123');

    component.inventoryForm.setValue({
      quantity: 20,
      lowStockThreshold: 5,
    });

    inventoryApiMock.createInventory.mockReturnValue(
      of(createdInventory),
    );

    component.createInventory();

    expect(inventoryApiMock.createInventory).toHaveBeenCalledWith(
      'business-123',
      {
        productId: 'product-123',
        quantity: 20,
        lowStockThreshold: 5,
      },
    );

    expect(component.inventory()).toEqual(createdInventory);
  });

  it('should increase stock and update inventory', () => {
    const currentInventory = {
      id: 'inventory-123',
      businessId: 'business-123',
      productId: 'product-123',
      quantity: 20,
      lowStockThreshold: 5,
      lowStock: false,
    };

    const updatedInventory = {
      ...currentInventory,
      quantity: 25,
    };

    component.selectedProductId.set('product-123');
    component.inventory.set(currentInventory);

    component.stockAdjustmentForm.setValue({
      amount: 5,
    });

    inventoryApiMock.increaseStock.mockReturnValue(
      of(updatedInventory),
    );

    component.increaseStock();

    expect(inventoryApiMock.increaseStock).toHaveBeenCalledWith(
      'business-123',
      'product-123',
      {
        amount: 5,
      },
    );

    expect(component.inventory()).toEqual(updatedInventory);
    expect(component.stockAdjustmentForm.controls.amount.value).toBe(1);
  });

  it('should decrease stock and update inventory', () => {
    const currentInventory = {
      id: 'inventory-123',
      businessId: 'business-123',
      productId: 'product-123',
      quantity: 20,
      lowStockThreshold: 5,
      lowStock: false,
    };

    const updatedInventory = {
      ...currentInventory,
      quantity: 15,
    };

    component.selectedProductId.set('product-123');
    component.inventory.set(currentInventory);

    component.stockAdjustmentForm.setValue({
      amount: 5,
    });

    inventoryApiMock.decreaseStock.mockReturnValue(
      of(updatedInventory),
    );

    component.decreaseStock();

    expect(inventoryApiMock.decreaseStock).toHaveBeenCalledWith(
      'business-123',
      'product-123',
      {
        amount: 5,
      },
    );

    expect(component.inventory()).toEqual(updatedInventory);
    expect(component.stockAdjustmentForm.controls.amount.value).toBe(1);
  });

  it('should show an error when decreasing more stock than available', () => {
    component.selectedProductId.set('product-123');

    component.stockAdjustmentForm.setValue({
      amount: 100,
    });

    inventoryApiMock.decreaseStock.mockReturnValue(
      throwError(() => ({
        status: 400,
      })),
    );

    component.decreaseStock();

    expect(component.inventoryError()).toBe(
      'Not enough stock available.',
    );
  });
});
