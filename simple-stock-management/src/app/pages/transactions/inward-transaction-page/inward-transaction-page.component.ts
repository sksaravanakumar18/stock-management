import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { MasterDataApiService, SupplierRecord, ProductRecord, DepartmentRecord } from '../../../shared/services/master-data-api.service';
import { TransactionService, InwardTransactionRequest, TransactionLineRequest } from '../../../shared/services/transaction.service';
import { StockTransactionService, StockTransaction } from '../../../shared/services/stock-transaction.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface LineItem {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

@Component({
    selector: 'app-inward-transaction-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, PageBreadcrumbComponent],
    templateUrl: './inward-transaction-page.component.html',
})
export class InwardTransactionPageComponent implements OnInit, OnDestroy {
    form!: FormGroup;
    lineItems: LineItem[] = [];
    suppliers: SupplierRecord[] = [];
    departments: DepartmentRecord[] = [];
    products: ProductRecord[] = [];
    filteredProducts: ProductRecord[] = [];
    transactions: StockTransaction[] = [];
    isLoading = false;
    successMessage = '';
    errorMessage = '';
    transactionId = '';

    private destroy$ = new Subject<void>();

    constructor(
        private readonly fb: FormBuilder,
        private readonly masterData: MasterDataApiService,
        private readonly transactionService: TransactionService,
        private readonly stockTransactionService: StockTransactionService,
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.form = this.fb.group({
            documentNo: ['', [Validators.required, Validators.minLength(3)]],
            departmentId: ['', Validators.required],
            supplierId: ['', Validators.required],
            transactionDate: [new Date().toISOString().slice(0, 10), Validators.required],
            notes: [''],
        });
    }

    private loadData(): void {
        this.masterData.getDepartments('ACTIVE').pipe(takeUntil(this.destroy$)).subscribe({
            next: (departments) => {
                this.departments = departments;
            },
            error: (error) => {
                console.error('Error loading departments:', error);
                this.errorMessage = 'Failed to load departments';
            },
        });

        this.masterData.getSuppliers('ACTIVE').pipe(takeUntil(this.destroy$)).subscribe({
            next: (suppliers) => {
                this.suppliers = suppliers;
            },
            error: (error) => {
                console.error('Error loading suppliers:', error);
                this.errorMessage = 'Failed to load suppliers';
            },
        });

        this.masterData.getProducts('ACTIVE').pipe(takeUntil(this.destroy$)).subscribe({
            next: (products) => {
                this.products = products;
                this.filteredProducts = products;
            },
            error: (error) => {
                console.error('Error loading products:', error);
                this.errorMessage = 'Failed to load products';
            },
        });

        this.transactions = this.stockTransactionService.transactions;
        this.addLineItem();
    }

    onDepartmentChange(): void {
        const selectedDepartmentId = this.form.get('departmentId')?.value;
        if (selectedDepartmentId) {
            this.filteredProducts = this.products.filter(p => p.departmentId === selectedDepartmentId);
        } else {
            this.filteredProducts = this.products;
        }
        this.lineItems = [];
        this.addLineItem();
    }

    addLineItem(): void {
        this.lineItems.push({
            id: crypto.randomUUID(),
            productId: '',
            quantity: 1,
            unitPrice: 0,
            taxRate: 0,
        });
    }

    removeLineItem(index: number): void {
        if (this.lineItems.length > 1) {
            this.lineItems = this.lineItems.filter((_, i) => i !== index);
        }
    }

    get subtotal(): number {
        return this.lineItems.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    }

    get taxTotal(): number {
        return this.lineItems.reduce((sum, line) => sum + (line.quantity * line.unitPrice * line.taxRate / 100), 0);
    }

    get totalValue(): number {
        return this.subtotal + this.taxTotal;
    }

    save(): void {
        this.errorMessage = '';
        this.successMessage = '';

        if (this.form.invalid) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        if (this.lineItems.some(line => !line.productId || line.quantity <= 0)) {
            this.errorMessage = 'All line items must have a product and quantity greater than 0';
            return;
        }

        const lines: TransactionLineRequest[] = this.lineItems.map(line => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
        }));

        const request: InwardTransactionRequest = {
            documentNo: this.form.get('documentNo')?.value,
            departmentId: this.form.get('departmentId')?.value,
            supplierId: this.form.get('supplierId')?.value,
            transactionDate: this.form.get('transactionDate')?.value,
            notes: this.form.get('notes')?.value || '',
            totalQuantity: this.lineItems.reduce((sum, line) => sum + line.quantity, 0),
            totalValue: this.totalValue,
            lines,
        };

        this.isLoading = true;
        this.transactionService.createInward(request).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.transactionId = response.id;
                this.successMessage = `Transaction created successfully. Transaction ID: ${response.id}`;
                this.resetForm();
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.error?.message || 'Failed to create transaction';
                console.error('Error creating transaction:', error);
            },
        });
    }

    private resetForm(): void {
        this.form.reset({
            documentNo: '',
            supplierId: '',
            transactionDate: new Date().toISOString().slice(0, 10),
            notes: '',
        });
        this.lineItems = [];
        this.addLineItem();
    }

    getProductName(productId: string): string {
        return this.products.find(p => p.id === productId)?.name || '';
    }

    updateProductPrice(line: LineItem): void {
        const product = this.products.find(p => p.id === line.productId);
        if (product) {
            line.unitPrice = product.purchasePrice;
            line.taxRate = product.taxRate;
        }
    }
}
