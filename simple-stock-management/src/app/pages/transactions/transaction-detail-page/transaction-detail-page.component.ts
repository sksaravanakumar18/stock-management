import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import {
    StockTransaction,
    StockTransactionLine,
    StockTransactionService,
} from '../../../shared/services/stock-transaction.service';

@Component({
    selector: 'app-transaction-detail-page',
    standalone: true,
    imports: [CommonModule, RouterModule, PageBreadcrumbComponent],
    templateUrl: './transaction-detail-page.component.html',
})
export class TransactionDetailPageComponent implements OnInit, OnDestroy {
    transaction: StockTransaction | null = null;
    private routeSubscription?: Subscription;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly transactionData: StockTransactionService,
    ) {}

    ngOnInit(): void {
        this.routeSubscription = this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            this.transaction = id
                ? this.transactionData.transactions.find(item => item.id === id) ?? null
                : null;
        });
    }

    ngOnDestroy(): void {
        this.routeSubscription?.unsubscribe();
    }

    get subtotal(): number {
        return this.transaction?.lines.reduce(
            (total, line) => total + line.quantity * line.unitPrice,
            0,
        ) ?? 0;
    }

    get taxTotal(): number {
        return this.transaction?.lines.reduce(
            (total, line) => total + this.lineTax(line),
            0,
        ) ?? 0;
    }

    get grandTotal(): number {
        return this.subtotal + this.taxTotal;
    }

    partyLabel(transaction: StockTransaction): string {
        if (transaction.type === 'PURCHASE_INWARD') return 'Supplier';
        if (transaction.type === 'SALES_OUTWARD' || transaction.type === 'SALES_RETURN') {
            return 'Customer';
        }
        return 'Related party';
    }

    lineTax(line: StockTransactionLine): number {
        return line.quantity * line.unitPrice * line.taxRate / 100;
    }

    typeLabel(transaction: StockTransaction): string {
        return transaction.type.replaceAll('_', ' ');
    }

    statusLabel(transaction: StockTransaction): string {
        return transaction.status.replaceAll('_', ' ');
    }

    print(): void {
        window.print();
    }
}