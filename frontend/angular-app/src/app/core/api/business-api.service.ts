import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {Business} from '../../models/business.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BusinessApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  getBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(
      `${this.apiBaseUrl}/api/businesses`,
    );
  }
}
