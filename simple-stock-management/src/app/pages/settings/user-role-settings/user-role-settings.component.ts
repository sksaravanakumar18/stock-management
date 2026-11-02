import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CheckboxComponent } from '../../../shared/components/form/input/checkbox.component';
import { DynamicFormComponent, DynamicFormField } from '../../../shared/components/form/dynamic-form/dynamic-form.component';
import {
  SETTINGS_PERMISSIONS,
  SettingsPermission,
  SettingsRole,
  SettingsUser,
  UserRoleSettingsService,
} from '../../../shared/services/user-role-settings.service';

type SettingsTab = 'USERS' | 'ROLES';

@Component({
  selector: 'app-user-role-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    CheckboxComponent,
    DynamicFormComponent,
  ],
  templateUrl: './user-role-settings.component.html',
})
export class UserRoleSettingsComponent {
  activeTab: SettingsTab = 'USERS';
  searchTerm = '';
  userModalOpen = false;
  editingUserId: string | null = null;
  formError = '';
  message = '';
  newRoleName = '';
  roleError = '';
  selectedRoleId = 'administrator';
  userFields: DynamicFormField[] = [];

  readonly permissions = SETTINGS_PERMISSIONS;
  readonly permissionGroups = [
    'Dashboard',
    'Masters',
    'Transactions',
    'Stock and Reports',
    'Reports',
    'Administration',
  ];

  constructor(private readonly settings: UserRoleSettingsService) {
    this.selectedRoleId = this.roles[0]?.id ?? '';
    this.userFields = this.createUserFields();
  }

  get users(): SettingsUser[] {
    return this.settings.users;
  }

  get roles(): SettingsRole[] {
    return this.settings.roles;
  }

  get filteredUsers(): SettingsUser[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) return this.users;

    return this.users.filter((user) =>
        [user.name, user.email, user.department, this.roleName(user.roleId)].some((value) =>
            value.toLowerCase().includes(query),
        ),
    );
  }

  get selectedRole(): SettingsRole | undefined {
    return this.roles.find((role) => role.id === this.selectedRoleId);
  }

  openNewUser(): void {
    this.editingUserId = null;
    this.formError = '';
    this.userFields = this.createUserFields();
    this.userModalOpen = true;
  }

  editUser(user: SettingsUser): void {
    this.editingUserId = user.id;
    this.formError = '';
    this.userFields = this.createUserFields(user);
    this.userModalOpen = true;
  }

  closeUserModal(): void {
    this.userModalOpen = false;
    this.editingUserId = null;
    this.formError = '';
  }

  saveUser(values: Record<string, unknown>): void {
    const name = this.stringValue(values['name']).trim();
    const email = this.stringValue(values['email']).trim().toLowerCase();
    const roleId = this.stringValue(values['roleId']);
    const department = this.stringValue(values['department']).trim();
    const password = this.stringValue(values['password']).trim();

    const existing = this.users.find((user) => user.id === this.editingUserId);

    if (!name || !email || !roleId || (!existing && !password)) {
      this.formError = 'Name, email, role, and password are required for a new user.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.formError = 'Enter a valid email address.';
      return;
    }

    const error = this.settings.saveUser({
      id: existing?.id ?? crypto.randomUUID(),
      name,
      email,
      roleId,
      department,
      isActive: values['isActive'] !== false,
      password: password || existing?.password || 'Welcome@123',
    });

    if (error) {
      this.formError = error;
      return;
    }

    this.message = existing ? 'User updated.' : 'User added.';
    this.closeUserModal();
  }

  toggleUserStatus(user: SettingsUser): void {
    const error = this.settings.saveUser({ ...user, isActive: !user.isActive });
    this.message = error ?? `User ${user.isActive ? 'deactivated' : 'activated'}.`;
  }

  roleName(roleId: string): string {
    return this.roles.find((role) => role.id === roleId)?.name ?? 'Unknown role';
  }

  permissionsFor(group: string): SettingsPermission[] {
    return this.permissions.filter((permission) => permission.group === group);
  }

  hasPermission(permissionId: string): boolean {
    return this.selectedRole?.permissionIds.includes(permissionId) ?? false;
  }

  setPermission(permissionId: string, enabled: boolean): void {
    const role = this.selectedRole;
    if (!role) return;

    const permissionIds = enabled
        ? [...new Set([...role.permissionIds, permissionId])]
        : role.permissionIds.filter((id) => id !== permissionId);

    this.roleError = this.settings.updateRolePermissions(role.id, permissionIds) ?? '';
    this.message = this.roleError ? '' : 'Role permissions saved.';
  }

  addRole(): void {
    const result = this.settings.addRole(this.newRoleName);
    if (typeof result === 'string') {
      this.roleError = result;
      return;
    }

    this.selectedRoleId = result.id;
    this.newRoleName = '';
    this.roleError = '';
    this.message = 'Custom role added.';
  }

  removeRole(role: SettingsRole): void {
    const error = this.settings.removeRole(role.id);
    if (error) {
      this.roleError = error;
      return;
    }

    if (this.selectedRoleId === role.id) {
      this.selectedRoleId = 'administrator';
    }

    this.roleError = '';
    this.message = 'Custom role removed.';
  }

  isBuiltInRole(roleId: string): boolean {
    return this.settings.isBuiltInRole(roleId);
  }

  private createUserFields(user?: SettingsUser): DynamicFormField[] {
    return [
      {
        name: 'name',
        type: 'text',
        label: 'Full name',
        required: true,
        value: user?.name ?? '',
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        required: true,
        value: user?.email ?? '',
      },
      {
        name: 'roleId',
        type: 'select',
        label: 'Role',
        required: true,
        value: user?.roleId ?? '',
        options: this.roles.map((role) => ({ value: role.id, label: role.name })),
      },
      {
        name: 'department',
        type: 'text',
        label: 'Department',
        value: user?.department ?? '',
      },
      {
        name: 'password',
        type: 'password',
        label: 'Password',
        required: !user,
        placeholder: user ? 'Leave blank to keep current password' : 'Set a password',
        value: user?.password ?? '',
        hint: user ? 'Leave blank to keep the current password.' : 'Use a temporary password for this user.',
      },
      {
        name: 'isActive',
        type: 'switch',
        label: 'Active',
        value: user?.isActive ?? true,
      },
    ];
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }
}