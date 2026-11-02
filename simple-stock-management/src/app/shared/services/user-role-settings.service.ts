import { Injectable } from '@angular/core';

export interface SettingsUser {
    id: string;
    name: string;
    email: string;
    roleId: string;
    department: string;
    isActive: boolean;
    password?: string;
}

export interface SettingsRole {
    id: string;
    name: string;
    description: string;
    permissionIds: string[];
}

export interface SettingsPermission {
    id: string;
    label: string;
    group: string;
}

interface SettingsState {
    users: SettingsUser[];
    roles: SettingsRole[];
}

export const SETTINGS_PERMISSIONS: SettingsPermission[] = [
    { id: 'dashboard.view', label: 'View dashboard', group: 'Dashboard' },
    { id: 'masters.view', label: 'View master data', group: 'Masters' },
    { id: 'masters.manage', label: 'Create and edit master data', group: 'Masters' },
    { id: 'transactions.view', label: 'View transactions', group: 'Transactions' },
    { id: 'transactions.create', label: 'Create inward and outward transactions', group: 'Transactions' },
    { id: 'transactions.dispatch', label: 'Mark outward orders ready and dispatch them', group: 'Transactions' },
    { id: 'stock.view', label: 'View stock and product ledger', group: 'Stock and Reports' },
    { id: 'reports.view', label: 'View stock balances, product ledger, and reports', group: 'Reports' },
    { id: 'audit.view', label: 'View audit history', group: 'Administration' },
    { id: 'users.manage', label: 'Manage users and roles', group: 'Administration' },
];

const BUILT_IN_ROLE_IDS = new Set([
    'administrator',
    'inventory-manager',
    'stock-operator',
    'report-viewer',
]);

const STORAGE_KEY = 'stock-management:user-role-settings:v1';

@Injectable({ providedIn: 'root' })
export class UserRoleSettingsService {
    private state = this.loadState();

    get users(): SettingsUser[] {
        return this.state.users;
    }

    get roles(): SettingsRole[] {
        return this.state.roles;
    }

    isBuiltInRole(roleId: string): boolean {
        return BUILT_IN_ROLE_IDS.has(roleId);
    }

    saveUser(user: SettingsUser): string | null {
        if (!this.state.roles.some(role => role.id === user.roleId)) {
            return 'Select an existing role.';
        }

        if (this.state.users.some(item =>
            item.id !== user.id && item.email.toLowerCase() === user.email.toLowerCase(),
        )) {
            return 'A user with this email already exists.';
        }

        const exists = this.state.users.some(item => item.id === user.id);
        const users = exists
            ? this.state.users.map(item => item.id === user.id ? user : item)
            : [...this.state.users, user];

        this.commit({ ...this.state, users });
        return null;
    }

    addRole(name: string): SettingsRole | string {
        const cleanName = name.trim();

        if (!cleanName) return 'Enter a role name.';
        if (this.state.roles.some(role => role.name.toLowerCase() === cleanName.toLowerCase())) {
            return 'A role with this name already exists.';
        }

        const role: SettingsRole = {
            id: crypto.randomUUID(),
            name: cleanName,
            description: 'Custom role.',
            permissionIds: [],
        };

        this.commit({ ...this.state, roles: [...this.state.roles, role] });
        return role;
    }

    updateRolePermissions(roleId: string, permissionIds: string[]): string | null {
        if (this.isBuiltInRole(roleId)) {
            return 'Built-in role permissions cannot be changed.';
        }

        if (!this.state.roles.some(role => role.id === roleId)) {
            return 'Role not found.';
        }

        const allowedIds = new Set(SETTINGS_PERMISSIONS.map(permission => permission.id));
        if (permissionIds.some(id => !allowedIds.has(id))) {
            return 'The role contains an unknown permission.';
        }

        const roles = this.state.roles.map(role =>
            role.id === roleId
                ? { ...role, permissionIds: [...new Set(permissionIds)] }
                : role,
        );

        this.commit({ ...this.state, roles });
        return null;
    }

    removeRole(roleId: string): string | null {
        if (this.isBuiltInRole(roleId)) {
            return 'Built-in roles cannot be removed.';
        }

        if (this.state.users.some(user => user.roleId === roleId)) {
            return 'Reassign users before removing this role.';
        }

        if (!this.state.roles.some(role => role.id === roleId)) {
            return 'Role not found.';
        }

        this.commit({
            ...this.state,
            roles: this.state.roles.filter(role => role.id !== roleId),
        });
        return null;
    }

    private commit(next: SettingsState): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        this.state = next;
    }

    private loadState(): SettingsState {
        const saved = localStorage.getItem(STORAGE_KEY);

        const allPermissions = SETTINGS_PERMISSIONS.map(permission => permission.id);
        const initial: SettingsState = {
            users: [
                {
                    id: 'admin-user',
                    name: 'Administrator',
                    email: 'admin@stock.local',
                    password: 'admin123',
                    roleId: 'administrator',
                    department: 'Administration',
                    isActive: true,
                },
                {
                    id: 'manager-user',
                    name: 'Inventory Manager',
                    email: 'manager@stock.local',
                    password: 'manager123',
                    roleId: 'inventory-manager',
                    department: 'Inventory',
                    isActive: true,
                },
                {
                    id: 'operator-user',
                    name: 'Stock Operator',
                    email: 'operator@stock.local',
                    password: 'operator123',
                    roleId: 'stock-operator',
                    department: 'Warehouse',
                    isActive: true,
                },
            ],
            roles: [
                {
                    id: 'administrator',
                    name: 'Administrator',
                    description: 'Full access to the application.',
                    permissionIds: allPermissions,
                },
                {
                    id: 'inventory-manager',
                    name: 'Inventory Manager',
                    description: 'Manage inventory operations and view reports.',
                    permissionIds: [
                        'dashboard.view', 'masters.view', 'masters.manage',
                        'transactions.view', 'transactions.create', 'transactions.dispatch',
                        'stock.view', 'reports.view', 'audit.view',
                    ],
                },
                {
                    id: 'stock-operator',
                    name: 'Stock Operator',
                    description: 'Record stock movements and view stock.',
                    permissionIds: [
                        'dashboard.view', 'masters.view', 'transactions.view',
                        'transactions.create', 'transactions.dispatch', 'stock.view',
                    ],
                },
                {
                    id: 'report-viewer',
                    name: 'Report Viewer',
                    description: 'Read-only access to stock and reports.',
                    permissionIds: [
                        'dashboard.view', 'masters.view', 'transactions.view',
                        'stock.view', 'reports.view',
                    ],
                },
            ],
        };
        if (saved !== null) {
            const parsed: unknown = JSON.parse(saved);
            if (!this.isSettingsState(parsed)) {
                throw new Error(`Invalid settings data in localStorage key "${STORAGE_KEY}".`);
            }
            return parsed;
        }


        this.commit(initial);
        return initial;
    }

    private isSettingsState(value: unknown): value is SettingsState {
        if (typeof value !== 'object' || value === null || !('users' in value) || !('roles' in value)) {
            return false;
        }

        if (!Array.isArray(value.users) || !Array.isArray(value.roles)) return false;

        return value.users.every(user =>
            typeof user === 'object' &&
            user !== null &&
            'id' in user && typeof user.id === 'string' &&
            'name' in user && typeof user.name === 'string' &&
            'email' in user && typeof user.email === 'string' &&
            'roleId' in user && typeof user.roleId === 'string' &&
            'department' in user && typeof user.department === 'string' &&
            'isActive' in user && typeof user.isActive === 'boolean' &&
            (!('password' in user) || typeof user.password === 'string' || user.password === undefined)
        ) && value.roles.every(role =>
            typeof role === 'object' &&
            role !== null &&
            'id' in role && typeof role.id === 'string' &&
            'name' in role && typeof role.name === 'string' &&
            'description' in role && typeof role.description === 'string' &&
            'permissionIds' in role &&
            Array.isArray(role.permissionIds) &&
            role.permissionIds.every((id: unknown) => typeof id === 'string')
        );
    }
}