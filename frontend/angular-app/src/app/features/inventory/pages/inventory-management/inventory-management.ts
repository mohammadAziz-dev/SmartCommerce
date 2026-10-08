import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {forkJoin, finalize, of, switchMap, tap, catchError} from 'rxjs';

import {InventoryApiService} from '../../../../core/api/inventory-api.service';
import {ProductApiService} from '../../../../core/api/product-api.service';
import {Inventory} from '../../../../models/inventory.model';
import {Product} from '../../../../models/product.model';
import {ConfirmationDialog} from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import {BusinessContextService} from '../../../../core/services/business-context.service';
import {BusinessContextHeader} from '../../../../shared/components/business-context-header/business-context-header';

@Component({
  selector: 'app-inventory-management',
  imports: [ReactiveFormsModule, ConfirmationDialog, BusinessContextHeader],
  templateUrl: './inventory-management.html',
  styleUrl: './inventory-management.scss',
})
export class InventoryManagement implements OnInit {
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly productApi = inject(ProductApiService);
  private readonly businessContext = inject(BusinessContextService);
  private readonly destroyRef = inject(DestroyRef);

  private inventoryEventSource: EventSource | null = null;

  readonly businessId = this.businessContext.businessId;
  private readonly businessId$ = toObservable(this.businessId);
  readonly products = signal<Product[]>([]);
  readonly inventories = signal<Inventory[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly selectedProductId = signal<string | null>(null);
  readonly inventoryActionError = signal<string | null>(null);
  readonly inventorySaving = signal(false);
  readonly adjustingStock = signal(false);
  readonly pendingStockIncrease = signal<number | null>(null);
  readonly pendingStockDecrease = signal<number | null>(null);
  readonly pendingInventoryCreation = signal<{
    quantity: number;
    lowStockThreshold: number;
  } | null>(null);

  readonly selectedProduct = computed(() => {
    const productId = this.selectedProductId();

    return this.products().find((product) => product.id === productId) ?? null;
  });

  readonly selectedInventory = computed(() => {
    const productId = this.selectedProductId();

    return this.inventories().find((inventory) => inventory.productId === productId) ?? null;
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

  readonly stockAdjustmentForm = new FormGroup({
    amount: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  readonly inventoryRows = computed(() => {
    const inventoriesByProductId = new Map(
      this.inventories().map((inventory) => [inventory.productId, inventory]),
    );

    return this.products().map((product) => ({
      product,
      inventory: inventoriesByProductId.get(product.id) ?? null,
    }));
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.inventoryEventSource?.close();
    });
  }

  selectProduct(productId: string): void {
    this.selectedProductId.set(productId);
    this.inventoryActionError.set(null);

    this.inventoryForm.reset({
      quantity: 0,
      lowStockThreshold: 5,
    });

    this.stockAdjustmentForm.reset({
      amount: 1,
    });
  }

  createInventory(): void {
    const businessId = this.businessId();
    const productId = this.selectedProductId();

    if (!businessId || !productId) {
      this.inventoryActionError.set('Business or Product ID is missing.');
      return;
    }

    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    const formValue = this.inventoryForm.getRawValue();

    this.inventorySaving.set(true);
    this.inventoryActionError.set(null);

    this.inventoryApi
      .createInventory(businessId, {
        productId,
        quantity: formValue.quantity,
        lowStockThreshold: formValue.lowStockThreshold,
      })
      .pipe(
        finalize(() => this.inventorySaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (createdInventory) => {
          this.inventories.update((inventories) => [
            ...inventories,
            createdInventory,
          ]);
        },
        error: () => {
          this.inventoryActionError.set('Could not create inventory.');
        },
      });
  }

  increaseStock(): void {
    this.adjustStock('increase');
  }

  decreaseStock(): void {
    this.adjustStock('decrease');
  }

  private adjustStock(operation: 'increase' | 'decrease'): void {
    const businessId = this.businessId();
    const productId = this.selectedProductId();

    if (!businessId || !productId) {
      this.inventoryActionError.set('Business or Product ID is missing.');
      return;
    }

    if (this.stockAdjustmentForm.invalid) {
      this.stockAdjustmentForm.markAllAsTouched();
      return;
    }

    const request = this.stockAdjustmentForm.getRawValue();

    this.adjustingStock.set(true);
    this.inventoryActionError.set(null);

    const request$ =
      operation === 'increase'
        ? this.inventoryApi.increaseStock(businessId, productId, request)
        : this.inventoryApi.decreaseStock(businessId, productId, request);

    request$
      .pipe(
        finalize(() => this.adjustingStock.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedInventory) => {
          this.inventories.update((inventories) =>
            inventories.map((inventory) =>
              inventory.productId === updatedInventory.productId
                ? updatedInventory
                : inventory,
            ),
          );

          this.stockAdjustmentForm.reset({
            amount: 1,
          });
        },
        error: (error: HttpErrorResponse) => {
          if (operation === 'decrease' && error.status === 400) {
            this.inventoryActionError.set('Not enough stock available.');
          } else {
            this.inventoryActionError.set(
              `Could not ${operation} stock. Please try again.`,
            );
          }
        },
      });
  }

  requestStockIncrease(): void {
    if (this.stockAdjustmentForm.invalid) {
      this.stockAdjustmentForm.markAllAsTouched();
      return;
    }

    this.pendingStockIncrease.set(
      this.stockAdjustmentForm.getRawValue().amount,
    );
  }

  requestStockDecrease(): void {
    if (this.stockAdjustmentForm.invalid) {
      this.stockAdjustmentForm.markAllAsTouched();
      return;
    }

    this.pendingStockDecrease.set(
      this.stockAdjustmentForm.getRawValue().amount,
    );
  }

  requestInventoryCreation(): void {
    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    this.pendingInventoryCreation.set(this.inventoryForm.getRawValue());
  }

  confirmStockIncrease(): void {
    this.pendingStockIncrease.set(null);
    this.increaseStock();
  }

  confirmStockDecrease(): void {
    this.pendingStockDecrease.set(null);
    this.decreaseStock();
  }

  confirmInventoryCreation(): void {
    this.pendingInventoryCreation.set(null);
    this.createInventory();
  }

  cancelStockIncrease(): void {
    this.pendingStockIncrease.set(null);
  }

  cancelStockDecrease(): void {
    this.pendingStockDecrease.set(null);
  }

  cancelInventoryCreation(): void {
    this.pendingInventoryCreation.set(null);
  }

  ngOnInit(): void {
    this.businessId$
      .pipe(
        tap(() => {
          // Close the previous business's SSE connection.
          this.inventoryEventSource?.close();
          this.inventoryEventSource = null;

          // Remove previous business data and selections.
          this.products.set([]);
          this.inventories.set([]);
          this.selectedProductId.set(null);
          this.loadError.set(null);
          this.inventoryActionError.set(null);
          this.pendingStockIncrease.set(null);
          this.pendingStockDecrease.set(null);
          this.pendingInventoryCreation.set(null);

          this.inventoryForm.reset({
            quantity: 0,
            lowStockThreshold: 5,
          });
          this.stockAdjustmentForm.reset({amount: 1});
        }),
        switchMap((businessId) => {
          if (!businessId) {
            this.loading.set(false);
            return of({products: [], inventories: []});
          }

          this.loading.set(true);
          this.subscribeToInventoryChanges(businessId);

          return forkJoin({
            products: this.productApi.getProducts(businessId),
            inventories: this.inventoryApi.getInventories(businessId),
          }).pipe(
            catchError(() => {
              this.loadError.set('Could not load inventory.');
              return of({products: [], inventories: []});
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({products, inventories}) => {
        this.products.set(products);
        this.inventories.set(inventories);
        this.loading.set(false);
      });
  }

  private loadInventoryOverview(businessId: string): void {
    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      products: this.productApi.getProducts(businessId),
      inventories: this.inventoryApi.getInventories(businessId),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({products, inventories}) => {
          this.products.set(products);
          this.inventories.set(inventories);
        },
        error: () => {
          this.loadError.set('Could not load inventory.');
        },
      });
  }

  private subscribeToInventoryChanges(businessId: string): void {
    this.inventoryEventSource = this.inventoryApi.subscribeToInventoryChanges(
      businessId,
      (event) => {
        if (this.businessId() !== businessId) {
          return;
        }

        this.inventories.update((inventories) =>
          inventories.map((inventory) =>
            inventory.productId === event.productId
              ? {
                ...inventory,
                quantity: event.quantity,
                lowStock: event.quantity <= inventory.lowStockThreshold,
              }
              : inventory,
          ),
        );
      },
    );
  }
}
