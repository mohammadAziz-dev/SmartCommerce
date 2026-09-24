import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OrderApiService } from '../../../../core/api/order-api.service';
import { Order } from '../../../../models/order.model';

@Component({
  selector: 'app-order-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail implements OnInit {
  private readonly orderApi = inject(OrderApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly businessId = signal<string | null>(null);

  ngOnInit(): void {
    const businessId = this.route.snapshot.queryParamMap.get('businessId');
    const orderId = this.route.snapshot.paramMap.get('orderId');

    if (!businessId || !orderId) {
      this.loadError.set('Order information is missing.');
      return;
    }

    this.businessId.set(businessId);
    this.loadOrder(businessId, orderId);
  }

  private loadOrder(businessId: string, orderId: string): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.orderApi
      .getOrder(businessId, orderId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (order) => this.order.set(order),
        error: () => this.loadError.set('Could not load order.'),
      });
  }
}
