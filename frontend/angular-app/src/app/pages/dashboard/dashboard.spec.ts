import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {vi} from 'vitest';

import {Dashboard} from './dashboard';
import {BusinessApiService} from '../../core/api/business-api.service';
import {BusinessContextService} from '../../core/services/business-context.service';
import {Business} from '../../models/business.model';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let context: BusinessContextService;
  let router: Router;

  const businesses: Business[] = [
    {id: 'business-123', name: 'SmartOffice Store'},
    {id: 'business-456', name: 'Aziz Electronics'},
  ];

  const getBusinesses = vi.fn();

  beforeEach(async () => {
    getBusinesses.mockReset();
    getBusinesses.mockReturnValue(of(businesses));

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: BusinessApiService,
          useValue: {getBusinesses},
        },
      ],
    }).compileComponents();

    context = TestBed.inject(BusinessContextService);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should load existing businesses', () => {
    expect(getBusinesses).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelectorAll('option').length).toBe(3);
  });

  it('should select a business and update the URL', async () => {
    const dashboard = fixture.componentInstance;

    dashboard.selectBusiness('business-123');
    await fixture.whenStable();

    expect(context.businessId()).toBe('business-123');
    expect(router.url).toContain('businessId=business-123');
  });

  it('should switch to another business', () => {
    const dashboard = fixture.componentInstance;

    dashboard.selectBusiness('business-123');
    dashboard.selectBusiness('business-456');

    expect(context.selectedBusiness()).toEqual(businesses[1]);
  });

  it('should clear the selection', async () => {
    const dashboard = fixture.componentInstance;

    dashboard.selectBusiness('business-123');
    dashboard.selectBusiness('');
    await fixture.whenStable();

    expect(context.businessId()).toBeNull();
    expect(router.url).not.toContain('businessId=');
  });

  it('should display an error when businesses cannot load', async () => {
    getBusinesses.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const errorFixture = TestBed.createComponent(Dashboard);
    errorFixture.detectChanges();
    await errorFixture.whenStable();

    expect(errorFixture.nativeElement.textContent).toContain(
      'Could not load businesses.',
    );
  });
});
