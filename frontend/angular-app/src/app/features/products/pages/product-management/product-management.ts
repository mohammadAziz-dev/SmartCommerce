import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ProductApiService } from '../../../../core/api/product-api.service';
import { Product } from '../../../../models/product.model';
import { InventoryApiService } from '../../../../core/api/inventory-api.service';
import { Inventory } from '../../../../models/inventory.model';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-product-management',
  imports: [
    ReactiveFormsModule,
    ConfirmationDialog,
  ],
  templateUrl: './product-management.html',
  styleUrl: './product-management.scss',
})
export class ProductManagement implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly productFormSection =
    viewChild<ElementRef<HTMLElement>>('productFormSection');
  private readonly inventorySection =
    viewChild<ElementRef<HTMLElement>>('inventorySection');

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly productLoadError = signal<string | null>(null);
  readonly productActionError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly businessId = signal<string | null>(null);
  readonly editingProductId = signal<string | null>(null);
  readonly selectedProductId = signal<string | null>(null);
  readonly inventory = signal<Inventory | null>(null);
  readonly inventoryLoading = signal(false);
  readonly inventoryError = signal<string | null>(null);
  readonly inventoryNotFound = signal(false);
  readonly productPendingDeactivation = signal<Product | null>(null);
  readonly pendingStockDecrease = signal<number | null>(null);

  readonly selectedProduct = computed(() => {
    const productId = this.selectedProductId();

    return (
      this.products().find((product) => product.id === productId) ?? null
    );
  });

  readonly isEditing = computed(
    () => this.editingProductId() !== null,
  );

  readonly productForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string | null>(null),
    sku: new FormControl<string | null>(null),
    sellingPrice: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    category: new FormControl<string | null>(null),
    active: new FormControl(true, {
      nonNullable: true,
    }),
  });

  readonly inventoryForm = new FormGroup({
    quantity: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    lowStockThreshold: new FormControl(5, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  readonly inventorySaving = signal(false);

  readonly stockAdjustmentForm = new FormGroup({
    amount: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  readonly adjustingStock = signal(false);

  editProduct(product: Product): void {
    this.editingProductId.set(product.id);

    this.productForm.setValue({
      name: product.name,
      description: product.description,
      sku: product.sku,
      sellingPrice: product.sellingPrice,
      category: product.category,
      active: product.active,
    });

    this.productFormSection()?.nativeElement.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  }

  private adjustStock(operation: 'increase' | 'decrease'): void {
    const businessId = this.businessId();
    const productId = this.selectedProductId();

    if (!businessId || !productId) {
      this.inventoryError.set('Business or Product ID is missing.');
      return;
    }

    if (this.stockAdjustmentForm.invalid) {
      this.stockAdjustmentForm.markAllAsTouched();
      return;
    }

    const request = this.stockAdjustmentForm.getRawValue();

    this.adjustingStock.set(true);
    this.inventoryError.set(null);

    const request$ =
      operation === 'increase'
        ? this.inventoryApi.increaseStock(
          businessId,
          productId,
          request,
        )
        : this.inventoryApi.decreaseStock(
          businessId,
          productId,
          request,
        );

    request$
      .pipe(
        finalize(() => this.adjustingStock.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedInventory) => {
          this.inventory.set(updatedInventory);

          this.stockAdjustmentForm.reset({
            amount: 1,
          });
        },
        error: (error: HttpErrorResponse) => {
          if (operation === 'decrease' && error.status === 400) {
            this.inventoryError.set(
              'Not enough stock available.',
            );
          } else {
            this.inventoryError.set(
              `Could not ${operation} stock. Please try again.`,
            );
          }
        },
      });
  }

  increaseStock(): void {
    this.adjustStock('increase');
  }

  decreaseStock(): void {
    this.adjustStock('decrease');
  }

  requestStockDecrease(): void {
    if (this.stockAdjustmentForm.invalid) {
      this.stockAdjustmentForm.markAllAsTouched();
      return;
    }

    const amount = this.stockAdjustmentForm.getRawValue().amount;
    this.pendingStockDecrease.set(amount);
  }

  cancelStockDecrease(): void {
    this.pendingStockDecrease.set(null);
  }

  confirmStockDecrease(): void {
    if (this.pendingStockDecrease() === null) {
      return;
    }

    this.pendingStockDecrease.set(null);
    this.decreaseStock();
  }

  createProduct(): void {
    const businessId = this.businessId();

    if (!businessId) {
      this.productActionError.set('Business ID is missing.');
      return;
    }

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.productActionError.set(null);

    const request = this.productForm.getRawValue();

    this.productApi
      .createProduct(businessId, request)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (createdProduct) => {
          this.products.update((products) => [
            ...products,
            createdProduct,
          ]);

          this.resetProductForm();
        },
        error: () => {
          this.productActionError.set('Could not create product.');
        },
      });
  }

  loadProducts(businessId: string): void {
    this.loading.set(true);
    this.productLoadError.set(null);

    this.productApi
      .getProducts(businessId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (products) => {
          this.products.set(products);
        },
        error: () => {
          this.productLoadError.set('Could not load products.');
        },
      });
  }

  cancelEdit(): void {
    this.editingProductId.set(null);
    this.resetProductForm();
  }

  submitProduct(): void {
    const businessId = this.businessId();

    if (!businessId) {
      this.productActionError.set('Business ID is missing.');
      return;
    }

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const editingProductId = this.editingProductId();

    if (editingProductId) {
      this.updateProduct(businessId, editingProductId);
    } else {
      this.createProduct();
    }
  }

  private updateProduct(
    businessId: string,
    productId: string,
  ): void {
    this.saving.set(true);
    this.productActionError.set(null);

    const request = this.productForm.getRawValue();

    this.productApi
      .updateProduct(businessId, productId, request)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedProduct) => {
          this.products.update((products) =>
            products.map((product) =>
              product.id === updatedProduct.id
                ? updatedProduct
                : product,
            ),
          );

          this.cancelEdit();
        },
        error: () => {
          this.productActionError.set('Could not update product.');
        },
      });
  }

  deactivateProduct(productId: string): void {
    const businessId = this.businessId();

    if (!businessId) {
      this.productActionError.set('Business ID is missing.');
      return;
    }

    this.productApi
      .deactivateProduct(businessId, productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedProduct) => {
          this.products.update((products) =>
            products.map((product) =>
              product.id === updatedProduct.id
                ? updatedProduct
                : product,
            ),
          );
        },
        error: () => {
          this.productActionError.set('Could not deactivate product.');
        },
      });
  }

  selectProduct(productId: string): void {
    const businessId = this.businessId();

    if (!businessId) {
      this.inventoryError.set('Business ID is missing.');
      return;
    }

    this.selectedProductId.set(productId);
    this.loadInventory(businessId, productId);

    this.inventorySection()?.nativeElement.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  }

  private resetProductForm(): void {
    this.productForm.reset({
      name: '',
      description: null,
      sku: null,
      sellingPrice: 0,
      category: null,
      active: true,
    });
  }

  private loadInventory(
    businessId: string,
    productId: string,
  ): void {
    this.inventoryNotFound.set(false);
    this.inventoryLoading.set(true);
    this.inventoryError.set(null);
    this.inventory.set(null);

    this.inventoryApi
      .getInventory(businessId, productId)
      .pipe(
        finalize(() => this.inventoryLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (inventory) => {
          this.inventory.set(inventory);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.inventoryNotFound.set(true);
            this.inventoryError.set(
              'No inventory found for this product.',
            );
          } else {
            this.inventoryError.set(
              'Could not load inventory. Please try again.',
            );
          }
        },
      });
  }

  createInventory(): void {
    const businessId = this.businessId();
    const productId = this.selectedProductId();

    if (!businessId || !productId) {
      this.inventoryError.set('Business or Product ID is missing.');
      return;
    }

    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    this.inventorySaving.set(true);
    this.inventoryError.set(null);

    const formValue = this.inventoryForm.getRawValue();

    const request = {
      productId,
      quantity: formValue.quantity,
      lowStockThreshold: formValue.lowStockThreshold,
    };

    this.inventoryApi
      .createInventory(businessId, request)
      .pipe(
        finalize(() => this.inventorySaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (createdInventory) => {
          this.inventory.set(createdInventory);
          this.inventoryNotFound.set(false);
        },
        error: () => {
          this.inventoryError.set('Could not create inventory.');
        },
      });
  }

  requestProductDeactivation(product: Product): void {
    this.productPendingDeactivation.set(product);
  }

  cancelProductDeactivation(): void {
    this.productPendingDeactivation.set(null);
  }

  confirmProductDeactivation(): void {
    const product = this.productPendingDeactivation();

    if (!product) {
      return;
    }

    this.productPendingDeactivation.set(null);
    this.deactivateProduct(product.id);
  }

  ngOnInit(): void {
    const businessId = this.route.snapshot.queryParamMap.get('businessId');

    if (!businessId) {
      this.productLoadError.set('Business ID is missing.');
      return;
    }

    this.businessId.set(businessId);
    this.loadProducts(businessId);
  }
}
