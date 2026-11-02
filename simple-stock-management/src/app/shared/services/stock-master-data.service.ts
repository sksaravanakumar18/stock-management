import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TaxType = 'GST' | 'VAT' | 'NONE';

export interface ProductRecord {
    id: string;
    sku: string;
    name: string;
    category: string;
    department: string;
    unit: string;
    purchasePrice: number;
    salesPrice: number;
    taxType: TaxType;
    taxRate: number;
    reorderLevel: number;
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

export type CustomerType = 'BUSINESS' | 'INDIVIDUAL';

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

@Injectable({ providedIn: 'root' })
export class StockMasterDataService {
    private readonly productsState = new BehaviorSubject<ProductRecord[]>([]);
    private readonly suppliersState = new BehaviorSubject<SupplierRecord[]>([]);

    readonly products$ = this.productsState.asObservable();
    readonly suppliers$ = this.suppliersState.asObservable();
    private readonly customersState = new BehaviorSubject<CustomerRecord[]>([]);
    readonly customers$ = this.customersState.asObservable();

    get customers(): CustomerRecord[] {
        return this.customersState.value;
    }

    upsertCustomer(customer: CustomerRecord): void {
        this.customersState.next(this.upsert(this.customers, customer));
    }

    removeCustomer(id: string): void {
        this.customersState.next(this.customers.filter(customer => customer.id !== id));
    }

    get products(): ProductRecord[] {
        return this.productsState.value;
    }

    get suppliers(): SupplierRecord[] {
        return this.suppliersState.value;
    }

    upsertProduct(product: ProductRecord): void {
        this.productsState.next(this.upsert(this.products, product));
    }

    upsertSupplier(supplier: SupplierRecord): void {
        this.suppliersState.next(this.upsert(this.suppliers, supplier));
    }

    removeProduct(id: string): void {
        this.productsState.next(this.products.filter(product => product.id !== id));
    }

    removeSupplier(id: string): void {
        this.suppliersState.next(this.suppliers.filter(supplier => supplier.id !== id));
    }

    private upsert<T extends { id: string }>(records: T[], record: T): T[] {
        const exists = records.some(item => item.id === record.id);

        return exists
            ? records.map(item => item.id === record.id ? record : item)
            : [...records, record];
    }
}