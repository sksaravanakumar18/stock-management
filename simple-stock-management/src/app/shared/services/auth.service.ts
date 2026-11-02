import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { AuthSession, LoginResponse, SessionUser } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly storageKey = 'stock-management:auth-session:v2';
    private readonly apiUrl = 'http://localhost:8082/api/v1/auth';
    private readonly sessionSubject =
        new BehaviorSubject<AuthSession | null>(this.readSession());

    readonly session$ = this.sessionSubject.asObservable();
    readonly currentUser$ = this.session$.pipe(map(session => session?.user ?? null));
    readonly isAuthenticated$ = this.session$.pipe(map(Boolean));

    constructor(private readonly http: HttpClient) {}

    get currentSession(): AuthSession | null {
        return this.sessionSubject.value;
    }

    get currentUser(): SessionUser | null {
        return this.currentSession?.user ?? null;
    }

    get accessToken(): string | null {
        return this.currentSession?.token ?? null;
    }

    get isAuthenticated(): boolean {
        return !!this.accessToken;
    }

    login(email: string, password: string): Observable<AuthSession> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
            map(response => ({
                user: {
                    id: response.user.id,
                    name: response.user.name,
                    email: response.user.email,
                    roleId: response.user.roleId,
                    department: response.user.departmentId ?? '',
                    departmentId: response.user.departmentId ?? null,
                    isActive: response.user.isActive,
                    permissions: response.user.permissions ?? [],
                },
                token: response.accessToken,
                loggedInAt: new Date().toISOString(),
                expiresAt: response.expiresAt,
            })),
            tap(session => {
                sessionStorage.setItem(this.storageKey, JSON.stringify(session));
                this.sessionSubject.next(session);
            }),
        );
    }

    logout(): void {
        sessionStorage.removeItem(this.storageKey);
        this.sessionSubject.next(null);
    }

    hasPermission(permission: string): boolean {
        return this.currentUser?.permissions.includes(permission) ?? false;
    }

    private readSession(): AuthSession | null {
        const raw = sessionStorage.getItem(this.storageKey);
        if (!raw) return null;

        try {
            const session: AuthSession = JSON.parse(raw);
            if (!session?.token || !session.user) {
                sessionStorage.removeItem(this.storageKey);
                return null;
            }
            return session;
        } catch {
            sessionStorage.removeItem(this.storageKey);
            return null;
        }
    }
}