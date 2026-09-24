import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { OrderApiService } from '../../../../core/api/order-api.service';
import { Order } from '../../../../models/order.model';

@Component({
  selector: 'app-order-management',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './order-management.html',
  styleUrl: './order-management.scss',
})
export class OrderManagement implements OnInit {
  private readonly orderApi = inject(OrderApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly businessId = signal<string | null>(null);

  ngOnInit(): void {
    const businessId = this.route.snapshot.queryParamMap.get('businessId');
    if (!businessId) {
      this.loadError.set('Business ID is missing.');
      return;
    }

    this.businessId.set(businessId);
    this.loadOrders(businessId);
  }

  private loadOrders(businessId: string): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.orderApi
      .getOrders(businessId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (orders) => this.orders.set(orders),
        error: () => this.loadError.set('Could not load orders.'),
      });
  }
}
