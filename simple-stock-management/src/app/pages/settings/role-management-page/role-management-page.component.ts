import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { RoleManagementService, RoleResponse, Permission } from '../../../shared/services/role-management.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-role-management-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PageBreadcrumbComponent],
    templateUrl: './role-management-page.component.html',
})
export class RoleManagementPageComponent implements OnInit, OnDestroy {
    form!: FormGroup;
    roles: RoleResponse[] = [];
    permissions: Permission[] = [];
    isLoading = false;
    isEditMode = false;
    selectedRoleId: string | null = null;
    successMessage = '';
    errorMessage = '';
    showForm = false;

    private destroy$ = new Subject<void>();

    constructor(
        private readonly fb: FormBuilder,
        private readonly roleService: RoleManagementService,
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            permissions: [[], Validators.required],
        });
    }

    private loadData(): void {
        this.roleService.getRoles().pipe(takeUntil(this.destroy$)).subscribe({
            next: (roles) => {
                this.roles = roles;
            },
            error: (error) => {
                console.error('Error loading roles:', error);
                this.errorMessage = 'Failed to load roles';
            },
        });

        this.roleService.getPermissions().pipe(takeUntil(this.destroy$)).subscribe({
            next: (permissions) => {
                this.permissions = permissions;
            },
            error: (error) => {
                console.error('Error loading permissions:', error);
                this.errorMessage = 'Failed to load permissions';
            },
        });
    }

    openForm(): void {
        this.isEditMode = false;
        this.selectedRoleId = null;
        this.form.reset();
        this.showForm = true;
        this.errorMessage = '';
        this.successMessage = '';
    }

    editRole(role: RoleResponse): void {
        this.isEditMode = true;
        this.selectedRoleId = role.id;
        this.form.patchValue({
            name: role.name,
            description: role.description,
            permissions: role.permissions.map(p => p.id),
        });
        this.showForm = true;
        this.errorMessage = '';
        this.successMessage = '';
    }

    closeForm(): void {
        this.showForm = false;
        this.form.reset();
        this.selectedRoleId = null;
    }

    save(): void {
        this.errorMessage = '';
        this.successMessage = '';

        if (this.form.invalid) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        const request = {
            name: this.form.get('name')?.value,
            description: this.form.get('description')?.value,
            permissionIds: this.form.get('permissions')?.value || [],
        };

        this.isLoading = true;

        if (this.isEditMode && this.selectedRoleId) {
            this.roleService.updateRole(this.selectedRoleId, request).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.successMessage = 'Role updated successfully';
                    this.loadData();
                    this.closeForm();
                },
                error: (error) => {
                    this.isLoading = false;
                    this.errorMessage = error.error?.message || 'Failed to update role';
                },
            });
        } else {
            this.roleService.createRole(request).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.successMessage = 'Role created successfully';
                    this.loadData();
                    this.closeForm();
                },
                error: (error) => {
                    this.isLoading = false;
                    this.errorMessage = error.error?.message || 'Failed to create role';
                },
            });
        }
    }

    deleteRole(role: RoleResponse): void {
        if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            return;
        }

        this.isLoading = true;
        this.roleService.deleteRole(role.id).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.isLoading = false;
                this.successMessage = 'Role deleted successfully';
                this.loadData();
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.error?.message || 'Failed to delete role';
            },
        });
    }

    getPermissionName(id: string): string {
        return this.permissions.find(p => p.id === id)?.name || id;
    }

    togglePermission(permissionId: string): void {
        const permissions = this.form.get('permissions')?.value || [];
        const index = permissions.indexOf(permissionId);

        if (index > -1) {
            permissions.splice(index, 1);
        } else {
            permissions.push(permissionId);
        }

        this.form.patchValue({ permissions });
    }

    isPermissionSelected(permissionId: string): boolean {
        const permissions = this.form.get('permissions')?.value || [];
        return permissions.includes(permissionId);
    }
}
