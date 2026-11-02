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
  departmentMasterConfig,
  MasterFormField,
} from '../../../shared/config/master-page.config';
import {
  DepartmentRecord,
  DepartmentRequest,
  MasterDataApiService,
} from '../../../shared/services/master-data-api.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-department-master',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent, DynamicGridComponent, DynamicFormComponent],
  templateUrl: './department-master.component.html',
})
export class DepartmentMasterComponent implements OnInit {
  readonly config = departmentMasterConfig;

  departments: DepartmentRecord[] = [];
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
    this.loadDepartments();
  }

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.loadDepartments();
  }

  setStatusFilter(filter: StatusFilter): void {
    if (this.statusFilter === filter) {
      return;
    }

    this.statusFilter = filter;
    this.formError = '';
    this.loadDepartments();
  }

  saveDepartment(values: Record<string, unknown>): void {
    const name = this.stringValue(values['name']).trim();
    const code = this.stringValue(values['code']).trim().toUpperCase();
    const location = this.stringValue(values['location']).trim();
    const description = this.stringValue(values['description']).trim();

    if (!name) {
      this.formError = 'Department name is required.';
      return;
    }

    const request: DepartmentRequest = {
      name,
      code,
      location,
      description,
      isActive: values['isActive'] !== false,
    };

    const action = this.editingId
      ? this.api.updateDepartment(this.editingId, request)
      : this.api.createDepartment(request);

    action.subscribe({
      next: () => {
        this.loadDepartments();
        this.resetForm();
      },
      error: () => {
        this.formError = 'Unable to save department.';
      },
    });
  }

  handleGridAction(event: DynamicGridActionEvent): void {
    const row = event.row;
    if (!this.isDepartment(row)) return;

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

    this.api.deleteDepartment(this.pendingDeleteId).subscribe({
      next: () => {
        this.deleteWarning = '';
        this.pendingDeleteId = null;
        this.loadDepartments();
      },
      error: (error: { error?: { message?: string } }) => {
        this.deleteWarning = error?.error?.message ?? 'Unable to delete department.';
      },
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.deleteWarning = '';
  }

  private loadDepartments(): void {
    const requestVersion = ++this.requestVersion;

    this.api.getDepartments(this.statusFilter, this.searchTerm).subscribe({
      next: (departments) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }
        this.departments = [...departments];
        this.cdr.markForCheck();
      },
      error: () => {
        if (requestVersion !== this.requestVersion) {
          return;
        }
        this.formError = 'Unable to load departments.';
        this.departments = [];
        this.cdr.markForCheck();
      },
    });
  }

  private createFormFields(department?: DepartmentRecord): MasterFormField[] {
    return this.config.form.fields.map(field => ({
      ...field,
      value: department ? this.fieldValue(department, field.name) : field.value,
    }));
  }

  private fieldValue(department: DepartmentRecord, name: string): unknown {
    switch (name) {
      case 'name': return department.name;
      case 'code': return department.code;
      case 'location': return department.location;
      case 'description': return department.description;
      case 'isActive': return department.isActive;
      default: return undefined;
    }
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private isDepartment(row: unknown): row is DepartmentRecord {
    return typeof row === 'object' &&
      row !== null &&
      'id' in row && typeof row.id === 'string' &&
      'name' in row && typeof row.name === 'string' &&
      'code' in row && typeof row.code === 'string' &&
      'location' in row && typeof row.location === 'string' &&
      'description' in row && typeof row.description === 'string' &&
      'isActive' in row && typeof row.isActive === 'boolean';
  }
}
