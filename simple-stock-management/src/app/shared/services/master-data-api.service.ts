import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type TaxType = 'GST' | 'VAT' | 'NONE';
export type CustomerType = 'BUSINESS' | 'INDIVIDUAL';

export interface CategoryRequest {
    name: string;
    code: string;
    description: string;
    isActive: boolean;
}

export interface CategoryRecord {
    id: string;
    name: string;
    code: string;
    description: string;
    isActive: boolean;
}

export interface DepartmentRequest {
    name: string;
    code: string;
    location: string;
    description: string;
    isActive: boolean;
}

export interface DepartmentRecord {
    id: string;
    name: string;
    code: string;
    location: string;
    description: string;
    isActive: boolean;
}

export interface CustomerRequest {
    code: string;
    name: string;
    type: CustomerType;
    contactPerson: string;
    phone: string;
    email: string;
    taxId: string;
    address: string;
    isActive: boolean;
}

export interface CustomerRecord {
    id: string;
    code: string;
    name: string;
    type: CustomerType;
    contactPerson: string;
    phone: string;
    email: string;
    taxId: string;
    address: string;
    isActive: boolean;
}

export interface SupplierRequest {
    code: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    taxId: string;
    address: string;
    isActive: boolean;
}

export interface SupplierRecord {
    id: string;
    code: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    taxId: string;
    address: string;
    isActive: boolean;
}

export interface ProductRequest {
    sku: string;
    name: string;
    categoryId: string | null;
    departmentId: string | null;
    unit: string;
    purchasePrice: number;
    salesPrice: number;
    taxType: TaxType;
    taxRate: number;
    reorderLevel: number;
    isActive: boolean;
}

export interface ProductRecord {
    id: string;
    sku: string;
    name: string;
    categoryId: string | null;
    departmentId: string | null;
    unit: string;
    purchasePrice: number;
    salesPrice: number;
    taxType: TaxType;
    taxRate: number;
    reorderLevel: number;
    isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class MasterDataApiService {
    private readonly apiBase = 'http://localhost:8082/api/v1';

    constructor(private readonly http: HttpClient) {}

    getCategories(status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL', search = ''): Observable<CategoryRecord[]> {
        let params = new HttpParams();
        if (status && status !== 'ALL') {
            params = params.set('status', status);
        }
        if (search && search.trim()) {
            params = params.set('search', search.trim());
        }
        return this.http.get<CategoryRecord[]>(`${this.apiBase}/categories`, { params });
    }

    createCategory(request: CategoryRequest): Observable<CategoryRecord> {
        return this.http.post<CategoryRecord>(`${this.apiBase}/categories`, request);
    }

    updateCategory(id: string, request: CategoryRequest): Observable<CategoryRecord> {
        return this.http.put<CategoryRecord>(`${this.apiBase}/categories/${id}`, request);
    }

    deleteCategory(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/categories/${id}`);
    }

    getDepartments(status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL', search = ''): Observable<DepartmentRecord[]> {
        let params = new HttpParams();
        if (status && status !== 'ALL') {
            params = params.set('status', status);
        }
        if (search && search.trim()) {
            params = params.set('search', search.trim());
        }
        return this.http.get<DepartmentRecord[]>(`${this.apiBase}/departments`, { params });
    }

    createDepartment(request: DepartmentRequest): Observable<DepartmentRecord> {
        return this.http.post<DepartmentRecord>(`${this.apiBase}/departments`, request);
    }

    updateDepartment(id: string, request: DepartmentRequest): Observable<DepartmentRecord> {
        return this.http.put<DepartmentRecord>(`${this.apiBase}/departments/${id}`, request);
    }

    deleteDepartment(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/departments/${id}`);
    }

    getCustomers(status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL', search = ''): Observable<CustomerRecord[]> {
        let params = new HttpParams();
        if (status && status !== 'ALL') {
            params = params.set('status', status);
        }
        if (search && search.trim()) {
            params = params.set('search', search.trim());
        }
        return this.http.get<CustomerRecord[]>(`${this.apiBase}/customers`, { params });
    }

    createCustomer(request: CustomerRequest): Observable<CustomerRecord> {
        return this.http.post<CustomerRecord>(`${this.apiBase}/customers`, request);
    }

    updateCustomer(id: string, request: CustomerRequest): Observable<CustomerRecord> {
        return this.http.put<CustomerRecord>(`${this.apiBase}/customers/${id}`, request);
    }

    deleteCustomer(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/customers/${id}`);
    }

    getSuppliers(status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL', search = ''): Observable<SupplierRecord[]> {
        let params = new HttpParams();
        if (status && status !== 'ALL') {
            params = params.set('status', status);
        }
        if (search && search.trim()) {
            params = params.set('search', search.trim());
        }
        return this.http.get<SupplierRecord[]>(`${this.apiBase}/suppliers`, { params });
    }

    createSupplier(request: SupplierRequest): Observable<SupplierRecord> {
        return this.http.post<SupplierRecord>(`${this.apiBase}/suppliers`, request);
    }

    updateSupplier(id: string, request: SupplierRequest): Observable<SupplierRecord> {
        return this.http.put<SupplierRecord>(`${this.apiBase}/suppliers/${id}`, request);
    }

    deleteSupplier(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/suppliers/${id}`);
    }

    getProducts(status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL', search = ''): Observable<ProductRecord[]> {
        let params = new HttpParams();
        if (status && status !== 'ALL') {
            params = params.set('status', status);
        }
        if (search && search.trim()) {
            params = params.set('search', search.trim());
        }
        return this.http.get<ProductRecord[]>(`${this.apiBase}/products`, { params });
    }

    createProduct(request: ProductRequest): Observable<ProductRecord> {
        return this.http.post<ProductRecord>(`${this.apiBase}/products`, request);
    }

    updateProduct(id: string, request: ProductRequest): Observable<ProductRecord> {
        return this.http.put<ProductRecord>(`${this.apiBase}/products/${id}`, request);
    }

    deleteProduct(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/products/${id}`);
    }
}
