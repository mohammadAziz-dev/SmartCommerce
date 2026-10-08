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
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, of, catchError, tap, finalize } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

import { ProductApiService } from '../../../../core/api/product-api.service';
import { Product } from '../../../../models/product.model';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { BusinessContextService } from '../../../../core/services/business-context.service';
import { BusinessContextHeader } from '../../../../shared/components/business-context-header/business-context-header';

@Component({
  selector: 'app-product-management',
  imports: [ReactiveFormsModule, RouterLink, ConfirmationDialog, BusinessContextHeader],
  templateUrl: './product-management.html',
  styleUrl: './product-management.scss',
})
export class ProductManagement implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly businessContext = inject(BusinessContextService);
  private readonly productFormSection = viewChild<ElementRef<HTMLElement>>('productFormSection');

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly productLoadError = signal<string | null>(null);
  readonly productActionError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly businessId = this.businessContext.businessId;
  private readonly businessId$ = toObservable(this.businessId);
  readonly editingProductId = signal<string | null>(null);
  readonly productPendingDeactivation = signal<Product | null>(null);

  readonly isEditing = computed(() => this.editingProductId() !== null);

  readonly productForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string | null>(null),
    imageUrl: new FormControl<string | null>(null),
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

  editProduct(product: Product): void {
    this.editingProductId.set(product.id);

    this.productForm.setValue({
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
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
          this.products.update((products) => [...products, createdProduct]);

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

  onProductImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.hidden = true;
    image.parentElement?.classList.add('image-unavailable');
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

  private updateProduct(businessId: string, productId: string): void {
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
              product.id === updatedProduct.id ? updatedProduct : product,
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
              product.id === updatedProduct.id ? updatedProduct : product,
            ),
          );
        },
        error: () => {
          this.productActionError.set('Could not deactivate product.');
        },
      });
  }

  private resetProductForm(): void {
    this.productForm.reset({
      name: '',
      description: null,
      imageUrl: null,
      sku: null,
      sellingPrice: 0,
      category: null,
      active: true,
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
    this.businessId$
      .pipe(
        tap(() => {
          this.products.set([]);
          this.productLoadError.set(null);
          this.productActionError.set(null);
          this.productPendingDeactivation.set(null);
          this.cancelEdit();
        }),
        switchMap((businessId) => {
          if (!businessId) {
            this.loading.set(false);
            return of([]);
          }

          this.loading.set(true);

          return this.productApi.getProducts(businessId).pipe(
            catchError(() => {
              this.productLoadError.set('Could not load products.');
              return of([]);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((products) => {
        this.products.set(products);
        this.loading.set(false);
      });
  }
}
