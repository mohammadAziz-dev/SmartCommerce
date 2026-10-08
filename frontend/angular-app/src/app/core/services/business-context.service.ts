import {computed, Injectable, signal} from '@angular/core';

import {Business} from '../../models/business.model';

@Injectable({
  providedIn: 'root',
})
export class BusinessContextService {
  private readonly selectedBusinessState = signal<Business | null>(null);

  readonly selectedBusiness = this.selectedBusinessState.asReadonly();

  readonly businessId = computed(
    () => this.selectedBusiness()?.id ?? null,
  );

  selectBusiness(business: Business): void {
    this.selectedBusinessState.set(business);
  }

  clearBusiness(): void {
    this.selectedBusinessState.set(null);
  }
}
