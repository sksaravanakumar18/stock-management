import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface TransactionLineRequest {
    productId: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    notes?: string;
}

export interface TransactionLineResponse extends TransactionLineRequest {
    id: string;
    productName: string;
    sku: string;
    unit: string;
}

export interface InwardTransactionRequest {
    documentNo: string;
    departmentId: string;
    supplierId: string;
    transactionDate: string;
    totalQuantity: number;
    totalValue: number;
    notes?: string;
    lines: TransactionLineRequest[];
}

export interface OutwardTransactionRequest {
    documentNo: string;
    departmentId: string;
    customerId: string;
    transactionDate: string;
    totalQuantity: number;
    totalValue: number;
    notes?: string;
    lines: TransactionLineRequest[];
}

export interface ReturnTransactionRequest {
    referenceTransactionId: string;
    returnDate: string;
    reason: string;
    quantity: number;
    notes?: string;
}

export interface CancelTransactionRequest {
    transactionId: string;
    cancelDate: string;
    reason: string;
    notes?: string;
}

export interface RejectTransactionRequest {
    transactionId: string;
    rejectDate: string;
    reason: string;
    quantity: number;
    notes?: string;
}

export interface TransactionResponse {
    id: string;
    documentNo: string;
    type: string;
    date: string;
    party: string;
    quantity: number;
    value: number;
    status: string;
    lines?: TransactionLineResponse[];
}

export interface TransactionFilters {
    type?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
    private readonly apiBase = 'http://localhost:8082/api/v1';

    constructor(private readonly http: HttpClient) {}

    createInward(request: InwardTransactionRequest): Observable<TransactionResponse> {
        return this.http.post<TransactionResponse>(`${this.apiBase}/stock-transactions/inward`, request);
    }

    createOutward(request: OutwardTransactionRequest): Observable<TransactionResponse> {
        return this.http.post<TransactionResponse>(`${this.apiBase}/stock-transactions/outward`, request);
    }

    createReturn(request: ReturnTransactionRequest): Observable<TransactionResponse> {
        return this.http.post<TransactionResponse>(`${this.apiBase}/stock-transactions/return`, request);
    }

    createCancel(request: CancelTransactionRequest): Observable<TransactionResponse> {
        return this.http.post<TransactionResponse>(`${this.apiBase}/stock-transactions/cancel`, request);
    }

    createReject(request: RejectTransactionRequest): Observable<TransactionResponse> {
        return this.http.post<TransactionResponse>(`${this.apiBase}/stock-transactions/reject`, request);
    }

    getAll(filters?: TransactionFilters): Observable<TransactionResponse[]> {
        let params = new HttpParams();
        if (filters) {
            if (filters.type) params = params.set('type', filters.type);
            if (filters.status) params = params.set('status', filters.status);
            if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
            if (filters.toDate) params = params.set('toDate', filters.toDate);
            if (filters.search) params = params.set('search', filters.search);
            if (filters.page) params = params.set('page', filters.page.toString());
            if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
        }
        return this.http.get<TransactionResponse[]>(`${this.apiBase}/stock-transactions`, { params });
    }

    getById(id: string): Observable<TransactionResponse> {
        return this.http.get<TransactionResponse>(`${this.apiBase}/stock-transactions/${id}`);
    }

    update(id: string, request: Partial<InwardTransactionRequest | OutwardTransactionRequest>): Observable<TransactionResponse> {
        return this.http.put<TransactionResponse>(`${this.apiBase}/stock-transactions/${id}`, request);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/stock-transactions/${id}`);
    }
}
