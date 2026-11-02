import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated) {
        return true;
    }

    router.navigate(['/signin'], {
        queryParams: { returnUrl: router.url },
    });

    return false;
};

export const guestGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated) {
        return true;
    }

    router.navigate(['/']);
    return false;
};

export const permissionGuard = (requiredPermissions: string | string[]): CanActivateFn => {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);
        const permissions = Array.isArray(requiredPermissions)
            ? requiredPermissions
            : [requiredPermissions];

        if (permissions.some((permission) => auth.hasPermission(permission))) {
            return true;
        }

        router.navigate(['/']);
        return false;
    };
};