import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TransactionService, ReturnTransactionRequest, CancelTransactionRequest, RejectTransactionRequest } from '../../../shared/services/transaction.service';
import { StockTransactionService, StockTransaction } from '../../../shared/services/stock-transaction.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type TabType = 'return' | 'cancel' | 'reject';

@Component({
    selector: 'app-returns-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PageBreadcrumbComponent],
    templateUrl: './returns-page.component.html',
})
export class ReturnsPageComponent implements OnInit, OnDestroy {
    activeTab: TabType = 'return';
    form!: FormGroup;
    transactions: StockTransaction[] = [];
    filteredTransactions: StockTransaction[] = [];
    isLoading = false;
    successMessage = '';
    errorMessage = '';
    selectedTransaction: StockTransaction | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private readonly fb: FormBuilder,
        private readonly transactionService: TransactionService,
        private readonly stockTransactionService: StockTransactionService,
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadTransactions();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.form = this.fb.group({
            referenceTransactionId: ['', Validators.required],
            date: [new Date().toISOString().slice(0, 10), Validators.required],
            reason: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            notes: [''],
        });
    }

    private loadTransactions(): void {
        this.transactions = this.stockTransactionService.transactions;
        this.filterTransactions();
    }

    setTab(tab: TabType): void {
        this.activeTab = tab;
        this.errorMessage = '';
        this.successMessage = '';
        this.selectedTransaction = null;
        this.form.reset({
            referenceTransactionId: '',
            date: new Date().toISOString().slice(0, 10),
            reason: '',
            quantity: 1,
            notes: '',
        });
        this.filterTransactions();
    }

    private filterTransactions(): void {
        switch (this.activeTab) {
            case 'return':
                this.filteredTransactions = this.transactions.filter(t =>
                    t.type === 'SALES_OUTWARD' && t.status === 'DISPATCHED',
                );
                break;
            case 'cancel':
                this.filteredTransactions = this.transactions.filter(t =>
                    t.type === 'SALES_OUTWARD' && (t.status === 'ORDERED' || t.status === 'READY_FOR_DISPATCH'),
                );
                break;
            case 'reject':
                this.filteredTransactions = this.transactions.filter(t =>
                    t.type === 'PURCHASE_INWARD' && t.status === 'RECORDED',
                );
                break;
            default:
                this.filteredTransactions = [];
        }
    }

    selectTransaction(transaction: StockTransaction): void {
        this.selectedTransaction = transaction;
        this.form.patchValue({
            referenceTransactionId: transaction.id,
            quantity: this.activeTab === 'reject' ? transaction.lines[0]?.quantity || 1 : 1,
        });
    }

    save(): void {
        this.errorMessage = '';
        this.successMessage = '';

        if (this.form.invalid) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        const date = this.form.get('date')?.value;
        const reason = this.form.get('reason')?.value;
        const quantity = this.form.get('quantity')?.value;
        const transactionId = this.form.get('referenceTransactionId')?.value;
        const notes = this.form.get('notes')?.value || '';

        if (!transactionId) {
            this.errorMessage = 'Please select a transaction';
            return;
        }

        this.isLoading = true;

        switch (this.activeTab) {
            case 'return':
                this.handleReturn(transactionId, date, reason, quantity, notes);
                break;
            case 'cancel':
                this.handleCancel(transactionId, date, reason, notes);
                break;
            case 'reject':
                this.handleReject(transactionId, date, reason, quantity, notes);
                break;
        }
    }

    private handleReturn(transactionId: string, date: string, reason: string, quantity: number, notes: string): void {
        const request: ReturnTransactionRequest = {
            referenceTransactionId: transactionId,
            returnDate: date,
            reason,
            quantity,
        };

        this.transactionService.createReturn(request).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.successMessage = `Return created successfully. Transaction ID: ${response.id}`;
                this.resetForm();
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.error?.message || 'Failed to create return';
                console.error('Error creating return:', error);
            },
        });
    }

    private handleCancel(transactionId: string, date: string, reason: string, notes: string): void {
        const request: CancelTransactionRequest = {
            transactionId,
            cancelDate: date,
            reason,
            notes,
        };

        this.transactionService.createCancel(request).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.successMessage = `Order cancelled successfully. Transaction ID: ${response.id}`;
                this.resetForm();
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.error?.message || 'Failed to cancel order';
                console.error('Error cancelling order:', error);
            },
        });
    }

    private handleReject(transactionId: string, date: string, reason: string, quantity: number, notes: string): void {
        const request: RejectTransactionRequest = {
            transactionId,
            rejectDate: date,
            reason,
            quantity,
            notes,
        };

        this.transactionService.createReject(request).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.successMessage = `Rejection created successfully. Transaction ID: ${response.id}`;
                this.resetForm();
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.error?.message || 'Failed to create rejection';
                console.error('Error creating rejection:', error);
            },
        });
    }

    private resetForm(): void {
        this.form.reset({
            referenceTransactionId: '',
            date: new Date().toISOString().slice(0, 10),
            reason: '',
            quantity: 1,
            notes: '',
        });
        this.selectedTransaction = null;
        this.loadTransactions();
    }

    getTotalQuantity(transaction: StockTransaction): number {
        return transaction.lines.reduce((sum, line) => sum + line.quantity, 0);
    }
}
