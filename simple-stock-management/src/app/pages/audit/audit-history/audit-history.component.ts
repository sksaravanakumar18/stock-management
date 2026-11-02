import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import {
  StockTransaction,
  StockTransactionService,
  TransactionType,
} from '../../../shared/services/stock-transaction.service';

type AuditTypeFilter = 'ALL' | TransactionType;

@Component({
  selector: 'app-audit-history',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './audit-history.component.html',
})
export class AuditHistoryComponent {
  searchTerm = '';
  typeFilter: AuditTypeFilter = 'ALL';
  dateFrom = '';
  dateTo = '';
  selectedTransaction: StockTransaction | null = null;

  readonly transactionTypes: { value: TransactionType; label: string }[] = [
    { value: 'PURCHASE_INWARD', label: 'Purchase / Inward' },
    { value: 'SALES_OUTWARD', label: 'Sales / Outward' },
    { value: 'INWARD_REJECTION', label: 'Inward Rejection' },
    { value: 'OUTWARD_REJECTION', label: 'Outward Rejection' },
    { value: 'SALES_RETURN', label: 'Sales Return' },
    { value: 'DAMAGE', label: 'Damage' },
    { value: 'ADJUSTMENT_IN', label: 'Stock Adjustment In' },
    { value: 'ADJUSTMENT_OUT', label: 'Stock Adjustment Out' },
  ];

  constructor(private readonly transactionData: StockTransactionService) {}

  get transactions(): StockTransaction[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.transactionData.transactions.filter(transaction => {
      const matchesType =
          this.typeFilter === 'ALL' || transaction.type === this.typeFilter;
      const matchesFrom = !this.dateFrom || transaction.date >= this.dateFrom;
      const matchesTo = !this.dateTo || transaction.date <= this.dateTo;
      const matchesSearch =
          !query ||
          [
            transaction.documentNo,
            transaction.party,
            transaction.department,
            transaction.reference,
            transaction.reason,
            transaction.status,
            ...transaction.lines.flatMap(line => [line.productName, line.sku]),
          ].some(value => value.toLowerCase().includes(query));

      return matchesType && matchesFrom && matchesTo && matchesSearch;
    });
  }

  get totalCount(): number {
    return this.transactionData.transactions.length;
  }

  get todayCount(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.transactionData.transactions.filter(item => item.date === today).length;
  }

  get exceptionCount(): number {
    return this.transactionData.transactions.filter(
        item =>
            item.status === 'CANCELLED' ||
            item.type === 'INWARD_REJECTION' ||
            item.type === 'OUTWARD_REJECTION' ||
            item.type === 'DAMAGE',
    ).length;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  onTypeChange(event: Event): void {
    this.typeFilter = (event.target as HTMLSelectElement).value as AuditTypeFilter;
  }

  onDateFromChange(event: Event): void {
    this.dateFrom = (event.target as HTMLInputElement).value;
  }

  onDateToChange(event: Event): void {
    this.dateTo = (event.target as HTMLInputElement).value;
  }

  typeLabel(type: TransactionType): string {
    return this.transactionTypes.find(item => item.value === type)?.label ?? type;
  }

  statusLabel(transaction: StockTransaction): string {
    return transaction.status.replaceAll('_', ' ');
  }

  totalQuantity(transaction: StockTransaction): number {
    return transaction.lines.reduce((total, line) => total + line.quantity, 0);
  }

  productSummary(transaction: StockTransaction): string {
    const names = transaction.lines.map(line => line.productName);
    return names.length > 2
        ? `${names.slice(0, 2).join(', ')} +${names.length - 2} more`
        : names.join(', ');
  }

  openDetails(transaction: StockTransaction): void {
    this.selectedTransaction = transaction;
  }

  closeDetails(): void {
    this.selectedTransaction = null;
  }
}