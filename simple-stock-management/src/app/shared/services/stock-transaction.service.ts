import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TransactionType =
    | 'PURCHASE_INWARD'
    | 'SALES_OUTWARD'
    | 'INWARD_REJECTION'
    | 'OUTWARD_REJECTION'
    | 'SALES_RETURN'
    | 'DAMAGE'
    | 'ADJUSTMENT_IN'
    | 'ADJUSTMENT_OUT';

export type TransactionStatus =
    | 'RECORDED'
    | 'ORDERED'
    | 'READY_FOR_DISPATCH'
    | 'DISPATCHED'
    | 'CANCELLED';

export interface StockTransactionLine {
    id: string;
    productId: string;
    sku: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate: number;
}

export interface StockTransaction {
    id: string;
    documentNo: string;
    type: TransactionType;
    date: string;
    department: string;
    party: string;
    reference: string;
    reason: string;
    returnCondition: 'GOOD' | 'DAMAGED';
    taxType: 'NONE' | 'GST' | 'VAT';
    lines: StockTransactionLine[];
    status: TransactionStatus;
    relatedTransactionId?: string;
}

@Injectable({ providedIn: 'root' })
export class StockTransactionService {
    private readonly state = new BehaviorSubject<StockTransaction[]>([]);

    get transactions(): StockTransaction[] {
        return this.state.value;
    }

    addTransaction(transaction: StockTransaction): string | null {
        if (this.hasDocumentNo(transaction.documentNo)) {
            return 'A transaction with this document number already exists.';
        }

        this.state.next([transaction, ...this.transactions]);
        return null;
    }

    markReadyForDispatch(id: string): string | null {
        const transaction = this.findOutward(id, 'ORDERED');
        if (typeof transaction === 'string') return transaction;

        this.replace(transaction, { ...transaction, status: 'READY_FOR_DISPATCH' });
        return null;
    }

    markDispatched(id: string): string | null {
        const transaction = this.findOutward(id, 'READY_FOR_DISPATCH');
        if (typeof transaction === 'string') return transaction;

        this.replace(transaction, { ...transaction, status: 'DISPATCHED' });
        return null;
    }

    cancelOutward(
        id: string,
        restockDocumentNo: string,
        date: string,
        reason: string,
    ): string | null {
        const transaction = this.transactions.find(item => item.id === id);

        if (!transaction || transaction.type !== 'SALES_OUTWARD') {
            return 'Only outward orders can be cancelled here.';
        }

        if (transaction.status === 'CANCELLED') {
            return 'This outward order is already cancelled.';
        }

        if (transaction.status === 'DISPATCHED') {
            if (this.hasDocumentNo(restockDocumentNo)) {
                return 'A restock entry with this document number already exists.';
            }

            const restock: StockTransaction = {
                ...transaction,
                id: crypto.randomUUID(),
                documentNo: restockDocumentNo,
                type: 'SALES_RETURN',
                date,
                reference: transaction.documentNo,
                reason,
                returnCondition: 'GOOD',
                status: 'RECORDED',
                relatedTransactionId: transaction.id,
                lines: transaction.lines.map(line => ({
                    ...line,
                    id: crypto.randomUUID(),
                })),
            };

            this.state.next([
                restock,
                ...this.transactions.map(item =>
                    item.id === id ? { ...item, status: 'CANCELLED' as const } : item,
                ),
            ]);
            return null;
        }

        if (transaction.status !== 'ORDERED' && transaction.status !== 'READY_FOR_DISPATCH') {
            return 'This outward order cannot be cancelled in its current status.';
        }

        this.replace(transaction, { ...transaction, status: 'CANCELLED' });
        return null;
    }

    private findOutward(
        id: string,
        requiredStatus: 'ORDERED' | 'READY_FOR_DISPATCH',
    ): StockTransaction | string {
        const transaction = this.transactions.find(item => item.id === id);

        if (!transaction || transaction.type !== 'SALES_OUTWARD') {
            return 'Only outward orders can use this action.';
        }

        if (transaction.status !== requiredStatus) {
            return `The outward order must be ${requiredStatus.replaceAll('_', ' ').toLowerCase()}.`;
        }

        return transaction;
    }

    private replace(previous: StockTransaction, updated: StockTransaction): void {
        this.state.next(this.transactions.map(item =>
            item.id === previous.id ? updated : item,
        ));
    }

    private hasDocumentNo(documentNo: string): boolean {
        return this.transactions.some(item =>
            item.documentNo.toLowerCase() === documentNo.toLowerCase(),
        );
    }
}