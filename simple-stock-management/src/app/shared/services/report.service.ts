import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface StockSummaryReport {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    value: number;
    reorderLevel: number;
    status: 'low' | 'optimal' | 'high';
}

export interface StockMovementReport {
    transactionId: string;
    documentNo: string;
    type: string;
    date: string;
    quantity: number;
    value: number;
    party: string;
}

export interface PurchaseReport {
    supplierId: string;
    supplierName: string;
    totalPurchases: number;
    totalQuantity: number;
    totalValue: number;
    transactionCount: number;
}

export interface DispatchReport {
    customerId: string;
    customerName: string;
    totalDispatches: number;
    totalQuantity: number;
    totalValue: number;
    transactionCount: number;
}

export interface ExceptionReport {
    productId: string;
    productName: string;
    sku: string;
    currentQuantity: number;
    reorderLevel: number;
    status: 'low_stock' | 'overstock' | 'critical';
}

export interface TaxReport {
    transactionId: string;
    documentNo: string;
    date: string;
    taxType: string;
    taxableAmount: number;
    taxAmount: number;
    totalAmount: number;
}

export interface ReportFilters {
    fromDate?: string;
    toDate?: string;
    supplierId?: string;
    customerId?: string;
    productId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
    private readonly apiBase = 'http://localhost:8082/api/v1';

    constructor(private readonly http: HttpClient) {}

    getStockSummary(filters?: ReportFilters): Observable<StockSummaryReport[]> {
        return this.buildRequestWithFilters(`${this.apiBase}/reports/stock-summary`, filters);
    }

    getStockMovement(filters?: ReportFilters): Observable<StockMovementReport[]> {
        return this.buildRequestWithFilters(`${this.apiBase}/reports/stock-movement`, filters);
    }

    getPurchaseReport(filters?: ReportFilters): Observable<PurchaseReport[]> {
        return this.buildRequestWithFilters(`${this.apiBase}/reports/purchase`, filters);
    }

    getDispatchReport(filters?: ReportFilters): Observable<DispatchReport[]> {
        return this.buildRequestWithFilters(`${this.apiBase}/reports/dispatch`, filters);
    }

    getExceptionReport(filters?: ReportFilters): Observable<ExceptionReport[]> {
        return this.buildRequestWithFilters(`${this.apiBase}/reports/exception`, filters);
    }

    getTaxReport(filters?: ReportFilters): Observable<TaxReport[]> {
        return this.buildRequestWithFilters(`${this.apiBase}/reports/tax`, filters);
    }

    getCustomReport(filters?: ReportFilters): Observable<unknown[]> {
        return this.buildRequestWithFilters(`${this.apiBase}/reports/custom`, filters);
    }

    export(format: 'csv' | 'excel' | 'pdf', type: string, filters?: ReportFilters): Observable<Blob> {
        let params = new HttpParams().set('format', format);
        if (filters) {
            if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
            if (filters.toDate) params = params.set('toDate', filters.toDate);
            if (filters.supplierId) params = params.set('supplierId', filters.supplierId);
            if (filters.customerId) params = params.set('customerId', filters.customerId);
            if (filters.productId) params = params.set('productId', filters.productId);
            if (filters.status) params = params.set('status', filters.status);
        }
        return this.http.get<Blob>(`${this.apiBase}/reports/${type}/export`, {
            params,
            responseType: 'blob' as 'json',
        });
    }

    private buildRequestWithFilters(endpoint: string, filters?: ReportFilters): Observable<unknown[]> {
        let params = new HttpParams();
        if (filters) {
            if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
            if (filters.toDate) params = params.set('toDate', filters.toDate);
            if (filters.supplierId) params = params.set('supplierId', filters.supplierId);
            if (filters.customerId) params = params.set('customerId', filters.customerId);
            if (filters.productId) params = params.set('productId', filters.productId);
            if (filters.status) params = params.set('status', filters.status);
            if (filters.page) params = params.set('page', filters.page.toString());
            if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
        }
        return this.http.get<unknown[]>(endpoint, { params });
    }
}
