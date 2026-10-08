import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {BusinessApiService} from './business-api.service';
import {Business} from '../../models/business.model';

describe('BusinessApiService', () => {
  let service: BusinessApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BusinessApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(BusinessApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should load existing businesses', () => {
    const businesses: Business[] = [
      {id: 'business-123', name: 'SmartOffice Store'},
      {id: 'business-456', name: 'Aziz Electronics'},
    ];

    service.getBusinesses().subscribe((result) => {
      expect(result).toEqual(businesses);
    });

    const request = httpTesting.expectOne('/api/businesses');

    expect(request.request.method).toBe('GET');

    request.flush(businesses);
  });
});
