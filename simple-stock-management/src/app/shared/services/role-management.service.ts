import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Permission {
    id: string;
    name: string;
    description: string;
}

export interface RoleRequest {
    name: string;
    description: string;
    permissionIds: string[];
}

export interface RoleResponse {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class RoleManagementService {
    private readonly apiBase = 'http://localhost:8082/api/v1';

    constructor(private readonly http: HttpClient) {}

    getRoles(): Observable<RoleResponse[]> {
        return this.http.get<RoleResponse[]>(`${this.apiBase}/roles`);
    }

    getRole(id: string): Observable<RoleResponse> {
        return this.http.get<RoleResponse>(`${this.apiBase}/roles/${id}`);
    }

    createRole(request: RoleRequest): Observable<RoleResponse> {
        return this.http.post<RoleResponse>(`${this.apiBase}/roles`, request);
    }

    updateRole(id: string, request: RoleRequest): Observable<RoleResponse> {
        return this.http.put<RoleResponse>(`${this.apiBase}/roles/${id}`, request);
    }

    deleteRole(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/roles/${id}`);
    }

    getPermissions(): Observable<Permission[]> {
        return this.http.get<Permission[]>(`${this.apiBase}/permissions`);
    }
}
