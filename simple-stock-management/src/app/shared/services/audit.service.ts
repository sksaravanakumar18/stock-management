import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuditEntry {
    id: string;
    entityType: string;
    entityId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    userId: string;
    userName: string;
    timestamp: string;
    changes?: Record<string, { oldValue: unknown; newValue: unknown }>;
    ipAddress?: string;
}

export interface AuditFilters {
    entityType?: string;
    operation?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
    private readonly apiBase = 'http://localhost:8082/api/v1';

    constructor(private readonly http: HttpClient) {}

    getAuditHistory(filters?: AuditFilters): Observable<AuditEntry[]> {
        let params = new HttpParams();
        if (filters) {
            if (filters.entityType) params = params.set('entityType', filters.entityType);
            if (filters.operation) params = params.set('operation', filters.operation);
            if (filters.userId) params = params.set('userId', filters.userId);
            if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
            if (filters.toDate) params = params.set('toDate', filters.toDate);
            if (filters.search) params = params.set('search', filters.search);
            if (filters.page) params = params.set('page', filters.page.toString());
            if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
        }
        return this.http.get<AuditEntry[]>(`${this.apiBase}/audit-history`, { params });
    }

    getAuditDetails(id: string): Observable<AuditEntry> {
        return this.http.get<AuditEntry>(`${this.apiBase}/audit-history/${id}`);
    }
}
