import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-signin-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './signin-form.component.html',
})
export class SigninFormComponent {
    email = '';
    password = '';
    keepSignedIn = false;
    showPassword = false;
    errorMessage = '';
    loading = false;

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {}

    onSignIn(): void {
        this.errorMessage = '';
        this.loading = true;

        this.authService.login(this.email.trim(), this.password)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: () => {
                    const requested = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
                    const returnUrl =
                        requested.startsWith('/') && !requested.startsWith('//') ? requested : '/';
                    void this.router.navigateByUrl(returnUrl);
                },
                error: (error: { status?: number }) => {
                    this.errorMessage = error.status === 401
                        ? 'Invalid email or password.'
                        : 'Unable to sign in. Check the server connection and try again.';
                },
            });
    }
}