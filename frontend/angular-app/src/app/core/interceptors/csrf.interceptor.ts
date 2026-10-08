import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {switchMap} from 'rxjs';
import {environment} from '../../../environments/environment';

interface CsrfToken {
  token: string;
  headerName: string;
}

export const csrfInterceptor: HttpInterceptorFn = (request, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return next(request);
  }

  const http = inject(HttpClient);

  return http
    .get<CsrfToken>(`${environment.apiBaseUrl}/api/auth/csrf`, {
      withCredentials: true,
    })
    .pipe(
      switchMap((csrf) =>
        next(
          request.clone({
            withCredentials: true,
            setHeaders: {
              [csrf.headerName]: csrf.token,
            },
          }),
        ),
      ),
    );
};
