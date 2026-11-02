import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ProductRecord, StockMasterDataService } from '../../../shared/services/stock-master-data.service';
import { StockTransaction, StockTransactionService } from '../../../shared/services/stock-transaction.service';
import { MasterDataApiService, ProductRecord as ApiProductRecord } from '../../../shared/services/master-data-api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ProductStockRow {
  product: ProductRecord;
  onHand: number;
  reserved: number;
  available: number;
}

@Component({
  selector: 'app-stock-dashboard',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './stock-dashboard.component.html',
})
export class StockDashboardComponent implements OnInit, OnDestroy {
  searchTerm = '';
  private destroy$ = new Subject<void>();

  constructor(
      private readonly masterData: StockMasterDataService,
      private readonly transactionData: StockTransactionService,
      private readonly masterDataApi: MasterDataApiService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    this.masterDataApi.getProducts('ACTIVE').pipe(takeUntil(this.destroy$)).subscribe({
      next: (products) => {
        products.forEach((product: ApiProductRecord) => {
          const stockProduct: ProductRecord = {
            id: product.id,
            sku: product.sku,
            name: product.name,
            category: '', // Will be looked up by category ID
            department: '', // Will be looked up by department ID
            unit: product.unit,
            purchasePrice: product.purchasePrice,
            salesPrice: product.salesPrice,
            taxType: product.taxType,
            taxRate: product.taxRate,
            reorderLevel: product.reorderLevel,
            isActive: product.isActive,
          };
          this.masterData.upsertProduct(stockProduct);
        });
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
  }

  get transactions(): StockTransaction[] {
    return this.transactionData.transactions;
  }

  get stockRows(): ProductStockRow[] {
    const balances = new Map<string, { onHand: number; reserved: number }>();
    const transactions = this.transactions;

    for (const product of this.masterData.products) {
      balances.set(product.id, { onHand: 0, reserved: 0 });
    }

    for (const transaction of transactions) {
      const cancelledAfterDispatch =
          transaction.type === 'SALES_OUTWARD' &&
          transaction.status === 'CANCELLED' &&
          transactions.some(item =>
              item.type === 'SALES_RETURN' &&
              item.relatedTransactionId === transaction.id,
          );

      for (const line of transaction.lines) {
        const balance = balances.get(line.productId);
        if (!balance) continue;

        switch (transaction.type) {
          case 'PURCHASE_INWARD':
          case 'ADJUSTMENT_IN':
            if (transaction.status !== 'CANCELLED') balance.onHand += line.quantity;
            break;
          case 'SALES_RETURN':
            if (transaction.returnCondition === 'GOOD') balance.onHand += line.quantity;
            break;
          case 'SALES_OUTWARD':
            if (transaction.status === 'DISPATCHED' || cancelledAfterDispatch) {
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
            if (transaction.status !== 'CANCELLED') balance.onHand -= line.quantity;
            break;
          case 'INWARD_REJECTION':
          case 'OUTWARD_REJECTION':
            break;
        }
      }
    }

    const query = this.searchTerm.trim().toLowerCase();

    return this.masterData.products
        .map(product => {
          const balance = balances.get(product.id) ?? { onHand: 0, reserved: 0 };
          return {
            product,
            onHand: balance.onHand,
            reserved: balance.reserved,
            available: balance.onHand - balance.reserved,
          };
        })
        .filter(row =>
            !query ||
            [row.product.sku, row.product.name, row.product.category, row.product.department]
                .some(value => value.toLowerCase().includes(query)),
        );
  }

  get totalOnHand(): number {
    return this.stockRows.reduce((total, row) => total + row.onHand, 0);
  }

  get totalReserved(): number {
    return this.stockRows.reduce((total, row) => total + row.reserved, 0);
  }

  get totalAvailable(): number {
    return this.stockRows.reduce((total, row) => total + row.available, 0);
  }

  get readyForDispatchCount(): number {
    return this.transactions.filter(
        transaction => transaction.status === 'READY_FOR_DISPATCH',
    ).length;
  }

  get recentTransactions(): StockTransaction[] {
    return this.transactions.slice(0, 8);
  }

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  transactionTypeLabel(transaction: StockTransaction): string {
    return transaction.type.replaceAll('_', ' ');
  }
}