import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DynamicFormComponent } from '../../../shared/components/form/dynamic-form/dynamic-form.component';

import {
  DynamicGridActionEvent,
  DynamicGridComponent,
} from '../../../shared/components/tables/dynamic-grid/dynamic-grid.component';
import {
  categoryMasterConfig,
  MasterFormField,
} from '../../../shared/config/master-page.config';
import {
  CategoryRecord,
  CategoryRequest,
  MasterDataApiService,
} from '../../../shared/services/master-data-api.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-category-master',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    DynamicGridComponent,
    DynamicFormComponent,
  ],
  templateUrl: './category-master.component.html',
})
export class CategoryMasterComponent implements OnInit {
  readonly config = categoryMasterConfig;

  categories: CategoryRecord[] = [];
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
    this.loadCategories();
  }

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.loadCategories();
  }

  setStatusFilter(status: StatusFilter): void {
    if (this.statusFilter === status) {
      console.warn('Same filter clicked, ignoring');
      return;
    }

    this.statusFilter = status;
    this.formError = '';
    console.log('Filter changed to:', status);
    this.loadCategories();
  }

  saveCategory(values: Record<string, unknown>): void {
    const name = this.stringValue(values['name']).trim();
    const code = this.stringValue(values['code']).trim().toUpperCase();
    const description = this.stringValue(values['description']).trim();

    if (!name) {
      this.formError = 'Category name is required.';
      return;
    }

    this.formError = '';

    const request: CategoryRequest = {
      name,
      code,
      description,
      isActive: values['isActive'] !== false,
    };

    const action = this.editingId
        ? this.api.updateCategory(this.editingId, request)
        : this.api.createCategory(request);

    action.subscribe({
      next: (saved) => {
        this.categories = this.editingId
            ? this.categories.map(category => category.id === this.editingId ? saved : category)
            : [saved, ...this.categories];

        this.loadCategories();
        this.resetForm();
      },
      error: () => {
        this.formError = 'Unable to save category. Please try again.';
      },
    });
  }

  handleGridAction(event: DynamicGridActionEvent): void {
    const row = event.row;
    if (!this.isCategory(row)) return;

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
    // DO NOT reset statusFilter
  }

  confirmDelete(): void {
    if (!this.pendingDeleteId) return;

    this.api.deleteCategory(this.pendingDeleteId).subscribe({
      next: () => {
        this.deleteWarning = '';
        this.pendingDeleteId = null;
        this.statusFilter = 'ALL';
        this.loadCategories();
      },
      error: (error: { error?: { message?: string } }) => {
        this.deleteWarning = error?.error?.message ?? 'Unable to delete category.';
      },
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.deleteWarning = '';
  }

  private loadCategories(): void {
    const requestVersion = ++this.requestVersion;

    this.api.getCategories(this.statusFilter, this.searchTerm).subscribe({
      next: (categories) => {
        if (requestVersion !== this.requestVersion) return;

        this.categories = Array.isArray(categories) ? [...categories] : [];

        // Force Angular to run change detection immediately
        this.cdr.markForCheck();

        console.log('Categories set to:', this.categories.length, 'records');
      },
      error: () => {
        if (requestVersion !== this.requestVersion) return;
        this.formError = 'Unable to load categories.';
        this.categories = [];
        this.cdr.markForCheck();
      },
    });
  }

  private createFormFields(category?: CategoryRecord): MasterFormField[] {
    return this.config.form.fields.map(field => ({
      ...field,
      value: category ? this.fieldValue(category, field.name) : field.value,
    }));
  }

  private fieldValue(category: CategoryRecord, name: string): unknown {
    switch (name) {
      case 'name': return category.name;
      case 'code': return category.code;
      case 'description': return category.description;
      case 'isActive': return category.isActive;
      default: return undefined;
    }
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private isCategory(row: unknown): row is CategoryRecord {
    return typeof row === 'object' &&
        row !== null &&
        'id' in row && typeof row.id === 'string' &&
        'name' in row && typeof row.name === 'string' &&
        'code' in row && typeof row.code === 'string' &&
        'description' in row && typeof row.description === 'string' &&
        'isActive' in row && typeof row.isActive === 'boolean';
  }
}