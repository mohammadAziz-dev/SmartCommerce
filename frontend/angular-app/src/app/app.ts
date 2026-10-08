import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import {catchError, filter, map, of, switchMap, distinctUntilChanged} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

import {BusinessApiService} from './core/api/business-api.service';
import {BusinessContextService} from './core/services/business-context.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly businessApi = inject(BusinessApiService);
  private readonly businessContext = inject(BusinessContextService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.route.snapshot.queryParamMap.get('businessId')),
        distinctUntilChanged(),
        switchMap((businessId) => {
          if (!businessId) {
            this.businessContext.clearBusiness();
            return of(null);
          }

          if (this.businessContext.businessId() === businessId) {
            return of(this.businessContext.selectedBusiness());
          }

          return this.businessApi.getBusinesses().pipe(
            map((businesses) =>
              businesses.find((business) => business.id === businessId) ?? null,
            ),
            catchError(() => of(this.businessContext.selectedBusiness())),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((business) => {
        if (business) {
          this.businessContext.selectBusiness(business);
        } else {
          this.businessContext.clearBusiness();
        }
      });
  }
}
