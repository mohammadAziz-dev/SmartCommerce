import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormsModule} from '@angular/forms';

import {BusinessApiService} from '../../core/api/business-api.service';
import {BusinessContextService} from '../../core/services/business-context.service';
import {Business} from '../../models/business.model';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly businessApi = inject(BusinessApiService);
  private readonly businessContext = inject(BusinessContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly businesses = signal<Business[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly selectedBusiness = this.businessContext.selectedBusiness;

  ngOnInit(): void {
    this.loading.set(true);

    this.businessApi
      .getBusinesses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (businesses) => {
          this.businesses.set(businesses);
          this.loading.set(false);

          const businessId =
            this.route.snapshot.queryParamMap.get('businessId') ??
            this.businessContext.businessId();

          const business = businesses.find((item) => item.id === businessId);

          if (business) {
            this.businessContext.selectBusiness(business);
          } else {
            this.businessContext.clearBusiness();
            void this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {businessId: null},
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
        },
        error: () => {
          this.loading.set(false);
          this.loadError.set('Could not load businesses.');
        },
      });
  }

  selectBusiness(businessId: string): void {
    const business = this.businesses().find((item) => item.id === businessId);

    if (!business) {
      this.businessContext.clearBusiness();
    } else {
      this.businessContext.selectBusiness(business);
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {businessId: business?.id ?? null},
      queryParamsHandling: 'merge',
    });
  }
}
