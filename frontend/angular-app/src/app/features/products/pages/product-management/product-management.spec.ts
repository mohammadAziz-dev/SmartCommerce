import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';

import {ProductManagement} from './product-management';
import {ProductApiService} from '../../../../core/api/product-api.service';
import {BusinessContextService} from '../../../../core/services/business-context.service';

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

  beforeEach(async () => {
    productApiMock.getProducts.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ProductManagement],
      providers: [
        {
          provide: ProductApiService,
          useValue: productApiMock,
        },
      ],
    }).compileComponents();

    const businessContext = TestBed.inject(BusinessContextService);
    businessContext.selectBusiness({
      id: 'business-123',
      name: 'SmartOffice Store',
    });

    fixture = TestBed.createComponent(ProductManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on initialization', () => {
    expect(productApiMock.getProducts).toHaveBeenCalledWith('business-123');

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

    productApiMock.createProduct.mockReturnValue(of(createdProduct));

    component.productForm.setValue({
      name: 'USB-C Hub',
      description: '7-in-1 USB-C Hub',
      imageUrl: null,
      sku: 'HUB-001',
      sellingPrice: 49.99,
      category: 'Accessories',
      active: true,
    });

    component.submitProduct();

    expect(productApiMock.createProduct).toHaveBeenCalledWith('business-123', {
      name: 'USB-C Hub',
      description: '7-in-1 USB-C Hub',
      imageUrl: null,
      sku: 'HUB-001',
      sellingPrice: 49.99,
      category: 'Accessories',
      active: true,
    });

    expect(component.products()).toEqual([createdProduct]);
    expect(component.productForm.controls.name.value).toBe('');
  });

  it('should update an existing product', () => {
    const existingProduct = {
      id: 'product-123',
      businessId: 'business-123',
      name: 'USB-C Hub',
      description: 'Old description',
      imageUrl: null,
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

    productApiMock.updateProduct.mockReturnValue(of(updatedProduct));

    component.submitProduct();

    expect(productApiMock.updateProduct).toHaveBeenCalledWith('business-123', 'product-123', {
      name: 'Premium USB-C Hub',
      description: 'Old description',
      imageUrl: null,
      sku: 'HUB-001',
      sellingPrice: 59.99,
      category: 'Accessories',
      active: true,
    });

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
      imageUrl: null,
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

    productApiMock.deactivateProduct.mockReturnValue(of(deactivatedProduct));

    component.deactivateProduct(activeProduct.id);

    expect(productApiMock.deactivateProduct).toHaveBeenCalledWith('business-123', 'product-123');

    expect(component.products()).toEqual([deactivatedProduct]);
    expect(component.products()[0].active).toBe(false);
  });

  it('should not submit an invalid product form', () => {
    component.productForm.patchValue({
      name: '',
      sellingPrice: -1,
    });

    component.submitProduct();

    expect(productApiMock.createProduct).not.toHaveBeenCalled();
    expect(productApiMock.updateProduct).not.toHaveBeenCalled();
  });

  it('should show an error when creating a product fails', () => {
    component.productForm.setValue({
      name: 'USB-C Hub',
      description: null,
      imageUrl: null,
      sku: null,
      sellingPrice: 49.99,
      category: null,
      active: true,
    });

    productApiMock.createProduct.mockReturnValue(throwError(() => new Error('API error')));

    component.submitProduct();

    expect(component.productActionError()).toBe('Could not create product.');
  });

  it('should show an error when loading products fails', () => {
    productApiMock.getProducts.mockReturnValue(throwError(() => new Error('API error')));

    component.loadProducts('business-123');

    expect(component.productLoadError()).toBe('Could not load products.');
  });

  it('should request and cancel product deactivation', () => {
    const product = {
      id: 'product-123',
      businessId: 'business-123',
      name: 'USB-C Hub',
      description: null,
      imageUrl: null,
      sku: null,
      sellingPrice: 49.99,
      category: null,
      active: true,
    };

    component.requestProductDeactivation(product);

    expect(component.productPendingDeactivation()).toEqual(product);

    component.cancelProductDeactivation();

    expect(component.productPendingDeactivation()).toBeNull();
  });

  it('should confirm product deactivation', () => {
    const product = {
      id: 'product-123',
      businessId: 'business-123',
      name: 'USB-C Hub',
      description: null,
      imageUrl: null,
      sku: null,
      sellingPrice: 49.99,
      category: null,
      active: true,
    };

    const deactivatedProduct = {
      ...product,
      active: false,
    };

    component.products.set([product]);
    component.productPendingDeactivation.set(product);

    productApiMock.deactivateProduct.mockReturnValue(of(deactivatedProduct));

    component.confirmProductDeactivation();

    expect(component.productPendingDeactivation()).toBeNull();
    expect(productApiMock.deactivateProduct).toHaveBeenCalledWith('business-123', 'product-123');
  });

  it('should hide a broken product image and show fallback', () => {
    const container = document.createElement('div');
    const image = document.createElement('img');
    container.appendChild(image);

    component.onProductImageError({target: image} as unknown as Event);

    expect(image.hidden).toBe(true);
    expect(container.classList.contains('image-unavailable')).toBe(true);
  });
});
