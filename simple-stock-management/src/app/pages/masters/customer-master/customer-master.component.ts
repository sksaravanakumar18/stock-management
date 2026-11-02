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
  customerMasterConfig,
  MasterFormField,
} from '../../../shared/config/master-page.config';
import {
  CustomerRecord,
  CustomerRequest,
  CustomerType,
  MasterDataApiService,
} from '../../../shared/services/master-data-api.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-customer-master',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent, DynamicGridComponent, DynamicFormComponent],
  templateUrl: './customer-master.component.html',
})
export class CustomerMasterComponent implements OnInit {
  readonly config = customerMasterConfig;

  customers: CustomerRecord[] = [];
  formFields: MasterFormField[] = this.createFormFields();
  editingId: string | null = null;
  formError = '';
  deleteWarning = '';
  pendingDeleteId: string | null = null;
  searchTerm = '';
  statusFilter: StatusFilter = 'ALL';
  private requestVersion = 0;

  constructor(
    private readonly api: MasterDataApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.loadCustomers();
  }

  setStatusFilter(filter: StatusFilter): void {
    if (this.statusFilter === filter) {
      return;
    }

    this.statusFilter = filter;
    this.formError = '';
    this.loadCustomers();
  }

  saveCustomer(values: Record<string, unknown>): void {
    const code = this.stringValue(values['code']).trim().toUpperCase();
    const name = this.stringValue(values['name']).trim();
    const type = this.stringValue(values['type']) as CustomerType;
    const contactPerson = this.stringValue(values['contactPerson']).trim();
    const phone = this.stringValue(values['phone']).trim();
    const email = this.stringValue(values['email']).trim();
    const taxId = this.stringValue(values['taxId']).trim();
    const address = this.stringValue(values['address']).trim();

    if (!name) {
      this.formError = 'Customer name is required.';
      return;
    }

    if (!type) {
      this.formError = 'Customer type is required.';
      return;
    }

    const request: CustomerRequest = {
      code,
      name,
      type: type || 'INDIVIDUAL',
      contactPerson,
      phone,
      email,
      taxId,
      address,
      isActive: values['isActive'] !== false,
    };

    const action = this.editingId
      ? this.api.updateCustomer(this.editingId, request)
      : this.api.createCustomer(request);

    action.subscribe({
      next: () => {
        this.loadCustomers();
        this.resetForm();
      },
      error: () => {
        this.formError = 'Unable to save customer.';
      },
    });
  }

  handleGridAction(event: DynamicGridActionEvent): void {
    const row = event.row;
    if (!this.isCustomer(row)) return;

    if (event.actionId === 'edit') {
      this.editingId = row.id;
      this.formFields = this.createFormFields(row);
      this.formError = '';
      this.deleteWarning = '';
    } else if (event.actionId === 'delete') {
      this.pendingDeleteId = row.id;
      this.deleteWarning = `Soft delete "${row.name}"? This will keep the record in the database as inactive and it will disappear from active lists.`;
      this.formError = '';
    }
  }

  cancelEdit(): void {
    this.editingId = null;
    this.formFields = this.createFormFields();
    this.formError = '';
  }

  private resetForm(): void {
    this.editingId = null;
    this.formFields = this.createFormFields();
    this.formError = '';
    this.deleteWarning = '';
    this.pendingDeleteId = null;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteId) return;

    this.api.deleteCustomer(this.pendingDeleteId).subscribe({
      next: () => {
        this.deleteWarning = '';
        this.pendingDeleteId = null;
        this.loadCustomers();
      },
      error: (error: { error?: { message?: string } }) => {
        this.deleteWarning = error?.error?.message ?? 'Unable to delete customer.';
      },
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.deleteWarning = '';
  }

  private loadCustomers(): void {
    const requestVersion = ++this.requestVersion;

    this.api.getCustomers(this.statusFilter, this.searchTerm).subscribe({
      next: (customers) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }
        this.customers = [...customers];
        this.cdr.markForCheck();
      },
      error: () => {
        if (requestVersion !== this.requestVersion) {
          return;
        }
        this.formError = 'Unable to load customers.';
        this.customers = [];
        this.cdr.markForCheck();
      },
    });
  }

  private createFormFields(customer?: CustomerRecord): MasterFormField[] {
    return this.config.form.fields.map(field => ({
      ...field,
      value: customer ? this.fieldValue(customer, field.name) : field.value,
    }));
  }

  private fieldValue(customer: CustomerRecord, name: string): unknown {
    switch (name) {
      case 'code': return customer.code;
      case 'name': return customer.name;
      case 'type': return customer.type;
      case 'contactPerson': return customer.contactPerson;
      case 'phone': return customer.phone;
      case 'email': return customer.email;
      case 'taxId': return customer.taxId;
      case 'address': return customer.address;
      case 'isActive': return customer.isActive;
      default: return undefined;
    }
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private isCustomer(row: unknown): row is CustomerRecord {
    return typeof row === 'object' &&
      row !== null &&
      'id' in row && typeof row.id === 'string' &&
      'code' in row && typeof row.code === 'string' &&
      'name' in row && typeof row.name === 'string' &&
      'type' in row &&
      'contactPerson' in row && typeof row.contactPerson === 'string' &&
      'phone' in row && typeof row.phone === 'string' &&
      'email' in row && typeof row.email === 'string' &&
      'taxId' in row && typeof row.taxId === 'string' &&
      'address' in row && typeof row.address === 'string' &&
      'isActive' in row && typeof row.isActive === 'boolean';
  }
}
