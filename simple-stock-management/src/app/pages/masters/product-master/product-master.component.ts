import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DynamicFormComponent } from '../../../shared/components/form/dynamic-form/dynamic-form.component';
import {
  DynamicGridActionEvent,
  DynamicGridComponent,
} from '../../../shared/components/tables/dynamic-grid/dynamic-grid.component';
import {
  MasterFormField,
  productMasterConfig,
} from '../../../shared/config/master-page.config';
import {
  CategoryRecord,
  DepartmentRecord,
  MasterDataApiService,
  ProductRecord,
  ProductRequest,
  TaxType,
} from '../../../shared/services/master-data-api.service';
import { StockTransactionService } from '../../../shared/services/stock-transaction.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

interface ProductWithStock extends ProductRecord {
  stock?: number;
}

@Component({
  selector: 'app-product-master',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent, DynamicGridComponent, DynamicFormComponent],
  templateUrl: './product-master.component.html',
})
export class ProductMasterComponent implements OnInit {
  readonly config = productMasterConfig;

  products: ProductWithStock[] = [];
  formFields: MasterFormField[] = [];
  editingId: string | null = null;
  formError = '';
  deleteWarning = '';
  pendingDeleteId: string | null = null;
  searchTerm = '';
  statusFilter: StatusFilter = 'ALL';
  showProductModal = false;
  
  private categories: CategoryRecord[] = [];
  private departments: DepartmentRecord[] = [];
  private requestVersion = 0;

  constructor(
    private readonly api: MasterDataApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly stockService: StockTransactionService,
  ) {}

  ngOnInit(): void {
    this.formFields = this.createFormFields();
    this.loadCategoriesAndDepartments().then(() => {
      this.loadProducts();
    });
  }

  private loadCategoriesAndDepartments(): Promise<void> {
    return new Promise((resolve) => {
      let categoriesLoaded = false;
      let departmentsLoaded = false;

      const checkComplete = () => {
        if (categoriesLoaded && departmentsLoaded) {
          resolve();
        }
      };

      this.api.getCategories('ACTIVE').subscribe({
        next: (categories) => {
          this.categories = categories;
          categoriesLoaded = true;
          this.updateFormFieldOptions();
          checkComplete();
        },
        error: () => {
          categoriesLoaded = true;
          checkComplete();
        }
      });

      this.api.getDepartments('ACTIVE').subscribe({
        next: (departments) => {
          this.departments = departments;
          departmentsLoaded = true;
          this.updateFormFieldOptions();
          checkComplete();
        },
        error: () => {
          departmentsLoaded = true;
          checkComplete();
        }
      });
    });
  }

  private updateFormFieldOptions(): void {
    this.formFields = this.createFormFields();
    this.cdr.markForCheck();
  }

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.loadProducts();
  }

  setStatusFilter(filter: StatusFilter): void {
    if (this.statusFilter === filter) {
      return;
    }

    this.statusFilter = filter;
    this.formError = '';
    this.loadProducts();
  }

  startNewProduct(): void {
    this.editingId = null;
    this.formFields = this.createFormFields();
    this.formError = '';
    this.deleteWarning = '';
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.resetForm();
  }

  saveProduct(values: Record<string, unknown>): void {
    const sku = this.stringValue(values['sku']).trim().toUpperCase();
    const name = this.stringValue(values['name']).trim();
    const categoryId = this.stringValue(values['categoryId']).trim() || null;
    const departmentId = this.stringValue(values['departmentId']).trim() || null;
    const unit = this.stringValue(values['unit']).trim();
    const purchasePrice = this.numberValue(values['purchasePrice']);
    const salesPrice = this.numberValue(values['salesPrice']);
    const taxType = this.stringValue(values['taxType']) as TaxType;
    const taxRate = this.numberValue(values['taxRate']);
    const reorderLevel = this.numberValue(values['reorderLevel']);

    if (!name) {
      this.formError = 'Product name is required.';
      return;
    }

    if (!categoryId) {
      this.formError = 'Category is required.';
      return;
    }

    const request: ProductRequest = {
      sku,
      name,
      categoryId,
      departmentId,
      unit,
      purchasePrice,
      salesPrice,
      taxType: taxType || 'NONE',
      taxRate,
      reorderLevel,
      isActive: values['isActive'] !== false,
    };

    const action = this.editingId
      ? this.api.updateProduct(this.editingId, request)
      : this.api.createProduct(request);

    action.subscribe({
      next: () => {
        this.closeProductModal();
        this.loadProducts();
      },
      error: () => {
        this.formError = 'Unable to save product.';
      },
    });
  }

  handleGridAction(event: DynamicGridActionEvent): void {
    const row = event.row;
    if (!this.isProduct(row)) return;

    if (event.actionId === 'edit') {
      this.editingId = row.id;
      this.formFields = this.createFormFields(row);
      this.formError = '';
      this.deleteWarning = '';
      this.showProductModal = true;
    } else if (event.actionId === 'delete') {
      this.pendingDeleteId = row.id;
      this.deleteWarning = `Soft delete "${row.name}"? This will keep the record in the database as inactive and it will disappear from active lists.`;
      this.formError = '';
    }
  }

  confirmDelete(): void {
    if (!this.pendingDeleteId) return;

    this.api.deleteProduct(this.pendingDeleteId).subscribe({
      next: () => {
        this.deleteWarning = '';
        this.pendingDeleteId = null;
        this.loadProducts();
      },
      error: (error: { error?: { message?: string } }) => {
        this.deleteWarning = error?.error?.message ?? 'Unable to delete product.';
      },
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.deleteWarning = '';
  }

  private resetForm(): void {
    this.editingId = null;
    this.formFields = this.createFormFields();
    this.formError = '';
    this.deleteWarning = '';
    this.pendingDeleteId = null;
  }

  private loadProducts(): void {
    const requestVersion = ++this.requestVersion;

    this.api.getProducts(this.statusFilter, this.searchTerm).subscribe({
      next: (products) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }
        // Add category, department names and stock for grid display
        this.products = products.map(product => ({
          ...product,
          category: this.getCategoryName(product.categoryId),
          department: this.getDepartmentName(product.departmentId),
          stock: this.calculateProductStock(product.id),
        }));
        this.cdr.markForCheck();
      },
      error: () => {
        if (requestVersion !== this.requestVersion) {
          return;
        }
        this.formError = 'Unable to load products.';
        this.products = [];
        this.cdr.markForCheck();
      },
    });
  }

  private calculateProductStock(productId: string): number {
    const transactions = this.stockService.transactions;
    let stock = 0;

    for (const transaction of transactions) {
      if (transaction.status === 'CANCELLED') continue;

      for (const line of transaction.lines) {
        if (line.productId === productId) {
          if (transaction.type === 'PURCHASE_INWARD' || transaction.type === 'ADJUSTMENT_IN') {
            stock += line.quantity;
          } else if (transaction.type === 'SALES_OUTWARD' || transaction.type === 'ADJUSTMENT_OUT' || transaction.type === 'DAMAGE') {
            stock -= line.quantity;
          } else if (transaction.type === 'SALES_RETURN' && transaction.returnCondition === 'GOOD') {
            stock += line.quantity;
          }
        }
      }
    }

    return Math.max(0, stock);
  }

  private getCategoryName(categoryId: string | null): string {
    if (!categoryId) return '-';
    return this.categories.find(c => c.id === categoryId)?.name ?? '-';
  }

  private getDepartmentName(departmentId: string | null): string {
    if (!departmentId) return '-';
    return this.departments.find(d => d.id === departmentId)?.name ?? '-';
  }

  private createFormFields(product?: ProductRecord): MasterFormField[] {
    return this.config.form.fields.map(field => {
      const fieldCopy = { ...field };
      
      // Update category field options
      if (field.name === 'categoryId') {
        fieldCopy.options = this.categories.map(cat => ({
          value: cat.id,
          label: cat.name,
        }));
        if (product) {
          fieldCopy.value = product.categoryId;
        }
      }
      // Update department field options
      else if (field.name === 'departmentId') {
        fieldCopy.options = this.departments.map(dept => ({
          value: dept.id,
          label: dept.name,
        }));
        if (product) {
          fieldCopy.value = product.departmentId;
        }
      }
      // Other fields
      else if (product) {
        fieldCopy.value = this.fieldValue(product, field.name);
      }
      
      return fieldCopy;
    });
  }

  private fieldValue(product: ProductRecord, name: string): unknown {
    switch (name) {
      case 'sku': return product.sku;
      case 'name': return product.name;
      case 'categoryId': return product.categoryId;
      case 'departmentId': return product.departmentId;
      case 'unit': return product.unit;
      case 'purchasePrice': return product.purchasePrice;
      case 'salesPrice': return product.salesPrice;
      case 'taxType': return product.taxType;
      case 'taxRate': return product.taxRate;
      case 'reorderLevel': return product.reorderLevel;
      case 'isActive': return product.isActive;
      default: return undefined;
    }
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private numberValue(value: unknown): number {
    const num = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN;
    return !isNaN(num) ? num : 0;
  }

  private isProduct(row: unknown): row is ProductRecord {
    return typeof row === 'object' &&
      row !== null &&
      'id' in row && typeof row.id === 'string' &&
      'sku' in row && typeof row.sku === 'string' &&
      'name' in row && typeof row.name === 'string' &&
      'unit' in row && typeof row.unit === 'string' &&
      'purchasePrice' in row && typeof row.purchasePrice === 'number' &&
      'salesPrice' in row && typeof row.salesPrice === 'number' &&
      'taxType' in row &&
      'taxRate' in row && typeof row.taxRate === 'number' &&
      'reorderLevel' in row && typeof row.reorderLevel === 'number' &&
      'isActive' in row && typeof row.isActive === 'boolean';
  }
}
