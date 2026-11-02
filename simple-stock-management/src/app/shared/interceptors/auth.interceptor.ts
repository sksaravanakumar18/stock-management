import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const token = auth.accessToken;

    const outgoing = token
        ? request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        })
        : request;

    return next(outgoing).pipe(
        catchError((error: unknown) => {
            if (
                error instanceof HttpErrorResponse &&
                error.status === 401 &&
                token &&
                !request.url.endsWith('/login')
            ) {
                auth.logout();
                void router.navigateByUrl('/signin');
            }
            return throwError(() => error);
        }),
    );
};