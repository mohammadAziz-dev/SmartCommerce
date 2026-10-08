import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {combineLatest, of, switchMap, catchError, tap} from 'rxjs';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {BusinessContextService} from '../../../../core/services/business-context.service';

import {OrderApiService} from '../../../../core/api/order-api.service';
import {Order} from '../../../../models/order.model';
import {BusinessContextHeader} from '../../../../shared/components/business-context-header/business-context-header';

@Component({
  selector: 'app-order-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink, BusinessContextHeader],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail implements OnInit {
  private readonly orderApi = inject(OrderApiService);
  private readonly businessContext = inject(BusinessContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly businessId = this.businessContext.businessId;
  private readonly businessId$ = toObservable(this.businessId);

  ngOnInit(): void {
    combineLatest([
      this.businessId$,
      this.route.paramMap,
    ])
      .pipe(
        tap(() => {
          this.order.set(null);
          this.loadError.set(null);
        }),
        switchMap(([businessId, params]) => {
          const orderId = params.get('orderId');

          if (!businessId || !orderId) {
            this.loading.set(false);
            this.loadError.set('Order information is missing.');
            return of(null);
          }

          this.loading.set(true);

          return this.orderApi.getOrder(businessId, orderId).pipe(
            catchError(() => {
              this.loadError.set('Could not load order.');
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((order) => {
        this.order.set(order);
        this.loading.set(false);
      });
  }
}
