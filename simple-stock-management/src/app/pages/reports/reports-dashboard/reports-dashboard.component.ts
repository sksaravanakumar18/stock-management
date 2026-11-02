import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import {
  ProductRecord,
  StockMasterDataService,
  TaxType,
} from '../../../shared/services/stock-master-data.service';
import {
  StockTransaction,
  StockTransactionService,
  TransactionType,
} from '../../../shared/services/stock-transaction.service';

type ReportType =
    | 'STOCK_SUMMARY'
    | 'MOVEMENT'
    | 'PURCHASES'
    | 'DISPATCH'
    | 'EXCEPTIONS'
    | 'TAX';

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  department: string;
  category: string;
  productId: string;
  transactionType: 'ALL' | TransactionType;
  taxType: 'ALL' | TaxType;
}

interface ReportRow {
  id: string;
  date: string;
  documentNo: string;
  type: string;
  productName: string;
  sku: string;
  category: string;
  department: string;
  party: string;
  status: string;
  quantity: number;
  unit: string;
  amount: number;
  tax: number;
  onHand?: number;
  reserved?: number;
  available?: number;
}

interface ReportRun {
  id: string;
  type: ReportType;
  label: string;
  generatedAt: string;
  filters: ReportFilters;
  rows: ReportRow[];
}

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './reports-dashboard.component.html',
})
export class ReportsDashboardComponent {
  activeTab: 'REPORTS' | 'HISTORY' = 'REPORTS';
  reportType: ReportType = 'STOCK_SUMMARY';
  rows: ReportRow[] = [];
  history: ReportRun[] = [];

  filters: ReportFilters = {
    dateFrom: '',
    dateTo: '',
    department: '',
    category: '',
    productId: '',
    transactionType: 'ALL',
    taxType: 'ALL',
  };

  readonly reportTypes: { value: ReportType; label: string }[] = [
    { value: 'STOCK_SUMMARY', label: 'Stock Summary' },
    { value: 'MOVEMENT', label: 'Stock Movement' },
    { value: 'PURCHASES', label: 'Inward / Purchases' },
    { value: 'DISPATCH', label: 'Outward / Dispatch' },
    { value: 'EXCEPTIONS', label: 'Returns, Damage & Rejections' },
    { value: 'TAX', label: 'Tax Summary' },
  ];

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

  constructor(
      private readonly masterData: StockMasterDataService,
      private readonly transactionData: StockTransactionService,
  ) {}

  get products(): ProductRecord[] {
    return this.masterData.products;
  }

  get departments(): string[] {
    return [...new Set(this.products.map(product => product.department).filter(Boolean))];
  }

  get categories(): string[] {
    return [...new Set(this.products.map(product => product.category).filter(Boolean))];
  }

  get totalQuantity(): number {
    return this.rows.reduce((total, row) => total + row.quantity, 0);
  }

  get totalAmount(): number {
    return this.rows.reduce((total, row) => total + row.amount, 0);
  }

  get totalTax(): number {
    return this.rows.reduce((total, row) => total + row.tax, 0);
  }

  reportLabel(type: ReportType): string {
    return this.reportTypes.find(item => item.value === type)?.label ?? type;
  }

  runReport(): void {
    this.rows = this.reportType === 'STOCK_SUMMARY'
        ? this.buildStockSummary()
        : this.buildTransactionRows();

    this.history = [
      {
        id: crypto.randomUUID(),
        type: this.reportType,
        label: this.reportLabel(this.reportType),
        generatedAt: new Date().toISOString(),
        filters: { ...this.filters },
        rows: [...this.rows],
      },
      ...this.history,
    ];

    this.activeTab = 'REPORTS';
  }

  viewHistory(run: ReportRun): void {
    this.reportType = run.type;
    this.filters = { ...run.filters };
    this.rows = [...run.rows];
    this.activeTab = 'REPORTS';
  }

  exportCsv(): void {
    const headings = this.reportType === 'STOCK_SUMMARY'
        ? ['Product', 'SKU', 'Category', 'Department', 'On hand', 'Reserved', 'Available']
        : ['Date', 'Document', 'Type', 'Product', 'SKU', 'Category', 'Department', 'Party', 'Status', 'Quantity', 'Amount', 'Tax'];

    const records = this.rows.map(row =>
        this.reportType === 'STOCK_SUMMARY'
            ? [row.productName, row.sku, row.category, row.department, row.onHand, row.reserved, row.available]
            : [row.date, row.documentNo, row.type, row.productName, row.sku, row.category, row.department, row.party, row.status, row.quantity, row.amount, row.tax],
    );

    const csv = [headings, ...records]
        .map(record => record.map(value => this.csvCell(value ?? '')).join(','))
        .join('\n');

    const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.reportType.toLowerCase()}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private buildTransactionRows(): ReportRow[] {
    const productsById = new Map(this.products.map(product => [product.id, product]));
    const rows: ReportRow[] = [];

    for (const transaction of this.transactionData.transactions) {
      if (!this.matchesTransaction(transaction)) continue;

      for (const line of transaction.lines) {
        const product = productsById.get(line.productId);
        const category = product?.category ?? '';
        const department = transaction.department || product?.department || '';

        if (this.filters.category && category !== this.filters.category) continue;
        if (this.filters.department && department !== this.filters.department) continue;
        if (this.filters.productId && line.productId !== this.filters.productId) continue;

        const amount = line.quantity * line.unitPrice;

        rows.push({
          id: `${transaction.id}-${line.id}`,
          date: transaction.date,
          documentNo: transaction.documentNo,
          type: transaction.type.replaceAll('_', ' '),
          productName: line.productName,
          sku: line.sku,
          category,
          department,
          party: transaction.party,
          status: transaction.status.replaceAll('_', ' '),
          quantity: line.quantity,
          unit: line.unit,
          amount,
          tax: amount * line.taxRate / 100,
        });
      }
    }

    return rows;
  }

  private buildStockSummary(): ReportRow[] {
    const productsById = new Map(this.products.map(product => [product.id, product]));
    const balances = new Map<string, { product: ProductRecord; department: string; onHand: number; reserved: number }>();
    const transactions = this.transactionData.transactions.filter(transaction =>
        !this.filters.dateTo || transaction.date <= this.filters.dateTo,
    );

    for (const product of this.products) {
      const department = product.department || '';
      balances.set(`${product.id}|${department}`, {
        product,
        department,
        onHand: 0,
        reserved: 0,
      });
    }

    for (const transaction of transactions) {
      const returnedAfterDispatch =
          transaction.type === 'SALES_OUTWARD' &&
          transaction.status === 'CANCELLED' &&
          transactions.some(item =>
              item.type === 'SALES_RETURN' &&
              item.relatedTransactionId === transaction.id,
          );

      for (const line of transaction.lines) {
        const product = productsById.get(line.productId);
        if (!product) continue;

        const department = transaction.department || product.department || '';
        const key = `${product.id}|${department}`;
        const balance = balances.get(key) ?? {
          product,
          department,
          onHand: 0,
          reserved: 0,
        };

        switch (transaction.type) {
          case 'PURCHASE_INWARD':
          case 'ADJUSTMENT_IN':
            balance.onHand += line.quantity;
            break;
          case 'SALES_RETURN':
            if (transaction.returnCondition === 'GOOD') balance.onHand += line.quantity;
            break;
          case 'SALES_OUTWARD':
            if (transaction.status === 'DISPATCHED' || returnedAfterDispatch) {
              balance.onHand -= line.quantity;
            } else if (
                transaction.status === 'ORDERED' ||
                transaction.status === 'READY_FOR_DISPATCH'
            ) {
              balance.reserved += line.quantity;
            }
            break;
          case 'DAMAGE':
          case 'ADJUSTMENT_OUT':
            balance.onHand -= line.quantity;
            break;
          case 'INWARD_REJECTION':
          case 'OUTWARD_REJECTION':
            break;
        }

        balances.set(key, balance);
      }
    }

    return [...balances.values()]
        .filter(balance =>
            (!this.filters.department || balance.department === this.filters.department) &&
            (!this.filters.category || balance.product.category === this.filters.category) &&
            (!this.filters.productId || balance.product.id === this.filters.productId),
        )
        .map(balance => ({
          id: `${balance.product.id}-${balance.department}`,
          date: this.filters.dateTo || 'Current',
          documentNo: '—',
          type: 'Stock balance',
          productName: balance.product.name,
          sku: balance.product.sku,
          category: balance.product.category,
          department: balance.department,
          party: '',
          status: '—',
          quantity: balance.onHand,
          unit: balance.product.unit,
          amount: 0,
          tax: 0,
          onHand: balance.onHand,
          reserved: balance.reserved,
          available: balance.onHand - balance.reserved,
        }));
  }

  private matchesTransaction(transaction: StockTransaction): boolean {
    if (this.filters.dateFrom && transaction.date < this.filters.dateFrom) return false;
    if (this.filters.dateTo && transaction.date > this.filters.dateTo) return false;
    if (this.filters.department && transaction.department !== this.filters.department) return false;
    if (this.filters.transactionType !== 'ALL' && transaction.type !== this.filters.transactionType) return false;
    if (this.filters.taxType !== 'ALL' && transaction.taxType !== this.filters.taxType) return false;

    switch (this.reportType) {
      case 'PURCHASES':
        return transaction.type === 'PURCHASE_INWARD' || transaction.type === 'INWARD_REJECTION';
      case 'DISPATCH':
        return transaction.type === 'SALES_OUTWARD' || transaction.type === 'OUTWARD_REJECTION';
      case 'EXCEPTIONS':
        return [
          'SALES_RETURN',
          'DAMAGE',
          'INWARD_REJECTION',
          'OUTWARD_REJECTION',
        ].includes(transaction.type) || transaction.status === 'CANCELLED';
      default:
        return true;
    }
  }

  private csvCell(value: unknown): string {
    const text = String(value);
    return `"${text.replaceAll('"', '""')}"`;
  }
}