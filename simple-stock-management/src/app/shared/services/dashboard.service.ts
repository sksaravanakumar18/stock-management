import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardSummary {
    totalProducts: number;
    totalStockValue: number;
    activeTransactions: number;
    lowStockItems: number;
}

export interface RecentTransaction {
    id: string;
    documentNo: string;
    type: string;
    date: string;
    party: string;
    quantity: number;
    value: number;
    status: string;
}

export interface StockLevel {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    value: number;
    reorderLevel: number;
}

export interface Alert {
    id: string;
    type: 'low_stock' | 'overstock' | 'critical';
    productId: string;
    productName: string;
    currentQuantity: number;
    threshold: number;
    severity: 'low' | 'medium' | 'high';
}

export interface InventoryMovement {
    date: string;
    inbound: number;
    outbound: number;
    adjustments: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly apiBase = 'http://localhost:8082/api/v1';

    constructor(private readonly http: HttpClient) {}

    getSummary(): Observable<DashboardSummary> {
        return this.http.get<DashboardSummary>(`${this.apiBase}/dashboard/summary`);
    }

    getRecentTransactions(limit = 10): Observable<RecentTransaction[]> {
        return this.http.get<RecentTransaction[]>(`${this.apiBase}/dashboard/transactions?limit=${limit}`);
    }

    getStockLevels(limit = 10): Observable<StockLevel[]> {
        return this.http.get<StockLevel[]>(`${this.apiBase}/dashboard/stock-levels?limit=${limit}`);
    }

    getAlerts(): Observable<Alert[]> {
        return this.http.get<Alert[]>(`${this.apiBase}/dashboard/alerts`);
    }

    getInventoryMovement(days = 30): Observable<InventoryMovement[]> {
        return this.http.get<InventoryMovement[]>(`${this.apiBase}/dashboard/inventory-movement?days=${days}`);
    }
}
