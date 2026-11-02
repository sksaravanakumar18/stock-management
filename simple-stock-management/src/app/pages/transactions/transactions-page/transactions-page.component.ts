import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { StockMasterDataService } from '../../../shared/services/stock-master-data.service';
import { MasterDataApiService, DepartmentRecord, SupplierRecord, CustomerRecord, ProductRecord } from '../../../shared/services/master-data-api.service';
import {
    StockTransaction,
    StockTransactionLine,
    StockTransactionService,
    TransactionType,
} from '../../../shared/services/stock-transaction.service';
import { Router } from '@angular/router';
import { CsvExportService } from '../../../shared/services/csv-export.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type TransactionFilter =
    | 'ALL'
    | 'INWARD'
    | 'OUTWARD'
    | 'READY'
    | 'DISPATCHED'
    | 'OTHER';

interface TransactionLineDraft {
    id: string;
    productId: string;
    sku: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate: number;
}

interface TransactionFilters {
    statusFilter: string;
    fromDate: string;
    toDate: string;
}

type SortColumn = 'date' | 'documentNo' | 'type' | 'quantity' | 'status';
type SortDirection = 'asc' | 'desc';

@Component({
    selector: 'app-transactions-page',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, PageBreadcrumbComponent],
    templateUrl: './transactions-page.component.html',
})
export class TransactionsPageComponent implements OnInit, OnDestroy {
    filter: TransactionFilter = 'ALL';
    searchTerm = '';
    showEntryModal = false;
    message = '';
    errorMessage = '';
    isLoading = false;
    
    pageSize = 10;
    currentPage = 1;
    pageSizes = [10, 25, 50, 100];
    
    sortColumn: SortColumn = 'date';
    sortDirection: SortDirection = 'desc';
    
    transactionFilters: TransactionFilters = {
        statusFilter: '',
        fromDate: '',
        toDate: '',
    };

    departments: DepartmentRecord[] = [];
    suppliers: SupplierRecord[] = [];
    customers: CustomerRecord[] = [];
    products: ProductRecord[] = [];

    form = this.emptyForm();
    lines: TransactionLineDraft[] = [this.emptyLine()];
    formGroup: FormGroup;

    readonly transactionTypes: { value: TransactionType; label: string }[] = [
        { value: 'PURCHASE_INWARD', label: 'Purchase / Inward' },
        { value: 'SALES_OUTWARD', label: 'Sales / Outward' },
        { value: 'INWARD_REJECTION', label: 'Inward Quality Rejection' },
        { value: 'OUTWARD_REJECTION', label: 'Outward Quality Rejection' },
        { value: 'SALES_RETURN', label: 'Customer Return' },
        { value: 'DAMAGE', label: 'Damage' },
        { value: 'ADJUSTMENT_IN', label: 'Stock Adjustment In' },
        { value: 'ADJUSTMENT_OUT', label: 'Stock Adjustment Out' },
    ];

    readonly statusOptions = ['RECORDED', 'ORDERED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'CANCELLED'];

    private destroy$ = new Subject<void>();

    constructor(
        private readonly transactionData: StockTransactionService,
        private readonly masterData: StockMasterDataService,
        private readonly masterDataApi: MasterDataApiService,
        private readonly router: Router,
        private readonly csvExportService: CsvExportService,
        private readonly notificationService: NotificationService,
        private readonly formBuilder: FormBuilder,
    ) {
        this.formGroup = this.createFormGroup();
    }

    ngOnInit(): void {
        this.loadFiltersFromStorage();
        this.loadMasterData();
    }

    private loadMasterData(): void {
        this.masterDataApi.getDepartments('ACTIVE').pipe(takeUntil(this.destroy$)).subscribe({
            next: (departments) => {
                this.departments = departments;
            },
            error: (error) => {
                console.error('Error loading departments:', error);
            },
        });

        this.masterDataApi.getSuppliers('ACTIVE').pipe(takeUntil(this.destroy$)).subscribe({
            next: (suppliers) => {
                this.suppliers = suppliers;
            },
            error: (error) => {
                console.error('Error loading suppliers:', error);
            },
        });

        this.masterDataApi.getCustomers('ACTIVE').pipe(takeUntil(this.destroy$)).subscribe({
            next: (customers) => {
                this.customers = customers;
            },
            error: (error) => {
                console.error('Error loading customers:', error);
            },
        });

        this.masterDataApi.getProducts('ACTIVE').pipe(takeUntil(this.destroy$)).subscribe({
            next: (products) => {
                this.products = products;
            },
            error: (error) => {
                console.error('Error loading products:', error);
            },
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createFormGroup(): FormGroup {
        return this.formBuilder.group({
            documentNo: ['', [Validators.required]],
            type: ['PURCHASE_INWARD', Validators.required],
            date: [new Date().toISOString().slice(0, 10), Validators.required],
            department: [''],
            party: [''],
            reference: [''],
            reason: [''],
            returnCondition: ['GOOD'],
            taxType: ['NONE'],
        });
    }

    private loadFiltersFromStorage(): void {
        const stored = localStorage.getItem('transactionFilters');
        if (stored) {
            try {
                this.transactionFilters = JSON.parse(stored);
            } catch (e) {
                this.transactionFilters = { statusFilter: '', fromDate: '', toDate: '' };
            }
        }
    }

    private saveFiltersToStorage(): void {
        localStorage.setItem('transactionFilters', JSON.stringify(this.transactionFilters));
    }

    get filteredProducts(): ProductRecord[] {
        if (this.form.department) {
            const selectedDept = this.departments.find(d => d.name === this.form.department);
            if (selectedDept) {
                return this.products.filter(p => p.departmentId === selectedDept.id);
            }
        }
        return this.products;
    }

    get transactions(): StockTransaction[] {
        const query = this.searchTerm.trim().toLowerCase();

        return this.transactionData.transactions.filter(transaction => {
            const matchesFilter = this.matchesFilter(transaction);
            const matchesSearch = !query ||
                [
                    transaction.documentNo,
                    transaction.party,
                    transaction.department,
                    transaction.reference,
                    transaction.reason,
                ].some(value => value.toLowerCase().includes(query));

            return matchesFilter && matchesSearch;
        });
    }

    openEntry(): void {
        this.errorMessage = '';
        this.message = '';
        this.form = this.emptyForm();
        this.lines = [this.emptyLine()];
        this.showEntryModal = true;
    }

    closeEntry(): void {
        this.showEntryModal = false;
        this.errorMessage = '';
    }

    addLine(): void {
        this.lines = [...this.lines, this.emptyLine()];
    }

    removeLine(id: string): void {
        if (this.lines.length > 1) {
            this.lines = this.lines.filter(line => line.id !== id);
        }
    }

    selectProduct(line: TransactionLineDraft): void {
        const product = this.products.find(item =>
            item.sku.toLowerCase() === line.sku.trim().toLowerCase(),
        );

        if (!product) {
            line.productId = '';
            line.productName = '';
            return;
        }
        line.taxRate = product.taxType === this.form.taxType ? product.taxRate : 0;
        line.productId = product.id;
        line.sku = product.sku;
        line.productName = product.name;
        line.unit = product.unit;
        line.unitPrice = this.form.type === 'PURCHASE_INWARD'
            ? product.purchasePrice
            : product.salesPrice;
    }

    saveTransaction(): void {
        this.errorMessage = '';
        this.message = '';

        const documentNo = this.form.documentNo.trim();
        if (!documentNo) {
            this.errorMessage = 'Document number is required.';
            return;
        }

        if (this.requiresParty() && !this.form.party.trim()) {
            this.errorMessage = `${this.partyLabel()} is required.`;
            return;
        }

        if (this.requiresReason() && !this.form.reason.trim()) {
            this.errorMessage = 'A reason is required for this operation.';
            return;
        }

        if (this.lines.some(line =>
            !line.productId || !Number.isFinite(line.quantity) || line.quantity <= 0,
        )) {
            this.errorMessage = 'Select a product and enter a quantity greater than zero for every line.';
            return;
        }

        const transaction: StockTransaction = {
            id: crypto.randomUUID(),
            documentNo,
            type: this.form.type,
            date: this.form.date,
            department: this.form.department.trim(),
            party: this.form.party.trim(),
            reference: this.form.reference.trim(),
            reason: this.form.reason.trim(),
            returnCondition: this.form.returnCondition,
            taxType: this.form.taxType,
            status: this.form.type === 'SALES_OUTWARD' ? 'ORDERED' : 'RECORDED',
            lines: this.lines.map(line => ({
                id: line.id,
                productId: line.productId,
                sku: line.sku,
                productName: line.productName,
                quantity: Number(line.quantity),
                unit: line.unit,
                unitPrice: Number(line.unitPrice),
                taxRate: Number(line.taxRate),
            })),
        };

        const error = this.transactionData.addTransaction(transaction);
        if (error) {
            this.errorMessage = error;
            return;
        }

        this.showEntryModal = false;
        this.message = 'Transaction recorded.';
    }

    markReady(transaction: StockTransaction): void {
        this.message = '';
        this.errorMessage = this.transactionData.markReadyForDispatch(transaction.id) ?? '';
    }

    dispatch(transaction: StockTransaction): void {
        this.message = '';
        this.errorMessage = this.transactionData.markDispatched(transaction.id) ?? '';
    }

    cancelOutward(transaction: StockTransaction): void {
        this.message = '';
        const restockDocumentNo = `RESTOCK-${transaction.documentNo}`;
        const error = this.transactionData.cancelOutward(
            transaction.id,
            restockDocumentNo,
            new Date().toISOString().slice(0, 10),
            `Cancellation/restock for ${transaction.documentNo}`,
        );

        this.errorMessage = error ?? '';
        if (!error) this.message = 'Outward order cancelled.';
    }

    typeLabel(type: TransactionType): string {
        return this.transactionTypes.find(item => item.value === type)?.label ?? type;
    }

    statusLabel(status: StockTransaction['status']): string {
        return status.replaceAll('_', ' ');
    }

    totalQuantity(transaction: StockTransaction): number {
        return transaction.lines.reduce((total, line) => total + line.quantity, 0);
    }

    isOutward(transaction: StockTransaction): boolean {
        return transaction.type === 'SALES_OUTWARD';
    }

    onSearchInput(event: Event): void {
        this.searchTerm = (event.target as HTMLInputElement).value;
    }

    private matchesFilter(transaction: StockTransaction): boolean {
        switch (this.filter) {
            case 'INWARD':
                return transaction.type === 'PURCHASE_INWARD' ||
                    transaction.type === 'INWARD_REJECTION';
            case 'OUTWARD':
                return transaction.type === 'SALES_OUTWARD' ||
                    transaction.type === 'OUTWARD_REJECTION';
            case 'READY':
                return transaction.status === 'READY_FOR_DISPATCH';
            case 'DISPATCHED':
                return transaction.status === 'DISPATCHED';
            case 'OTHER':
                return [
                    'SALES_RETURN',
                    'DAMAGE',
                    'ADJUSTMENT_IN',
                    'ADJUSTMENT_OUT',
                ].includes(transaction.type);
            default:
                return true;
        }
    }

    private requiresParty(): boolean {
        return [
            'PURCHASE_INWARD',
            'SALES_OUTWARD',
            'SALES_RETURN',
        ].includes(this.form.type);
    }

    private partyLabel(): string {
        return this.form.type === 'PURCHASE_INWARD' ? 'Supplier' : 'Customer';
    }

    private requiresReason(): boolean {
        return [
            'INWARD_REJECTION',
            'OUTWARD_REJECTION',
            'DAMAGE',
            'ADJUSTMENT_IN',
            'ADJUSTMENT_OUT',
        ].includes(this.form.type);
    }

    private emptyForm() {
        return {
            type: 'PURCHASE_INWARD' as TransactionType,
            documentNo: '',
            date: new Date().toISOString().slice(0, 10),
            department: '',
            party: '',
            reference: '',
            reason: '',
            returnCondition: 'GOOD' as 'GOOD' | 'DAMAGED',
            taxType: 'NONE' as 'NONE' | 'GST' | 'VAT',
        };
    }

    private emptyLine(): TransactionLineDraft {
        return {
            id: crypto.randomUUID(),
            productId: '',
            sku: '',
            productName: '',
            quantity: 1,
            unit: 'piece',
            unitPrice: 0,
            taxRate: 0,
        };
    }
    openDetails(transaction: StockTransaction): void {
        void this.router.navigate(['/transactions', transaction.id]);
    }

    printRegister(): void {
        window.print();
    }
    lineSubtotal(line: TransactionLineDraft): number {
        return Number(line.quantity) * Number(line.unitPrice);
    }

    lineTax(line: TransactionLineDraft): number {
        return this.lineSubtotal(line) * Number(line.taxRate) / 100;
    }

    lineTotal(line: TransactionLineDraft): number {
        return this.lineSubtotal(line) + this.lineTax(line);
    }

    get subtotal(): number {
        return this.lines.reduce((total, line) => total + this.lineSubtotal(line), 0);
    }

    get taxTotal(): number {
        return this.lines.reduce((total, line) => total + this.lineTax(line), 0);
    }

    get grandTotal(): number {
        return this.subtotal + this.taxTotal;
    }

    onTransactionTypeChange(): void {
        this.lines = this.lines.map(line => {
            const product = this.products.find(item => item.id === line.productId);
            if (!product) return line;

            return {
                ...line,
                unitPrice: this.form.type === 'PURCHASE_INWARD'
                    ? product.purchasePrice
                    : product.salesPrice,
            };
        });
    }
}