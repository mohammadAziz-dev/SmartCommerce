import {TestBed} from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {csrfInterceptor} from './csrf.interceptor';

describe('csrfInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([csrfInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should not request a CSRF token for GET requests', () => {
    http.get('/api/test').subscribe();

    const request = httpTesting.expectOne('/api/test');

    expect(request.request.method).toBe('GET');

    request.flush({});
  });

  it('should add the CSRF token to PATCH requests', () => {
    http.patch('/api/test', {amount: 5}).subscribe();

    const csrfRequest = httpTesting.expectOne('/api/auth/csrf');

    expect(csrfRequest.request.method).toBe('GET');

    csrfRequest.flush({
      token: 'test-csrf-token',
      headerName: 'X-CSRF-TOKEN',
    });

    const patchRequest = httpTesting.expectOne('/api/test');

    expect(patchRequest.request.method).toBe('PATCH');
    expect(patchRequest.request.headers.get('X-CSRF-TOKEN')).toBe(
      'test-csrf-token',
    );

    patchRequest.flush({});
  });
});
