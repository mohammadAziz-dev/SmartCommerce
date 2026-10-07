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
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs';

import {ProductApiService} from '../../../../core/api/product-api.service';
import {Product} from '../../../../models/product.model';
import {ConfirmationDialog} from '../../../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-product-management',
  imports: [ReactiveFormsModule, ConfirmationDialog],
  templateUrl: './product-management.html',
  styleUrl: './product-management.scss',
})
export class ProductManagement implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly productFormSection = viewChild<ElementRef<HTMLElement>>('productFormSection');

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly productLoadError = signal<string | null>(null);
  readonly productActionError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly businessId = signal<string | null>(null);
  readonly editingProductId = signal<string | null>(null);
  readonly productPendingDeactivation = signal<Product | null>(null);

  readonly isEditing = computed(() => this.editingProductId() !== null);

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
    const businessId = this.route.snapshot.queryParamMap.get('businessId');

    if (!businessId) {
      this.productLoadError.set('Business ID is missing.');
      return;
    }

    this.businessId.set(businessId);
    this.loadProducts(businessId);
  }
}
