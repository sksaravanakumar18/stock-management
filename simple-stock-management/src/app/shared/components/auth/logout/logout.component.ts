import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-logout',
    standalone: true,
    template: '',
})
export class LogoutComponent implements OnInit {
    constructor(
        private readonly authService: AuthService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.authService.logout();
        this.router.navigateByUrl('/signin');
    }
}