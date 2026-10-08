import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {of, switchMap, catchError, tap} from 'rxjs';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {BusinessContextService} from '../../../../core/services/business-context.service';
import {CurrencyPipe, DatePipe} from '@angular/common';

import {OrderApiService} from '../../../../core/api/order-api.service';
import {Order} from '../../../../models/order.model';
import {BusinessContextHeader} from '../../../../shared/components/business-context-header/business-context-header';

@Component({
  selector: 'app-order-management',
  imports: [CurrencyPipe, DatePipe, RouterLink, BusinessContextHeader],
  templateUrl: './order-management.html',
  styleUrl: './order-management.scss',
})
export class OrderManagement implements OnInit {
  private readonly orderApi = inject(OrderApiService);
  private readonly businessContext = inject(BusinessContextService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly businessId = this.businessContext.businessId;
  private readonly businessId$ = toObservable(this.businessId);

  ngOnInit(): void {
    this.businessId$
      .pipe(
        tap(() => {
          this.orders.set([]);
          this.loadError.set(null);
        }),
        switchMap((businessId) => {
          if (!businessId) {
            this.loading.set(false);
            return of([]);
          }

          this.loading.set(true);

          return this.orderApi.getOrders(businessId).pipe(
            catchError(() => {
              this.loadError.set('Could not load orders.');
              return of([]);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      });
  }
}
