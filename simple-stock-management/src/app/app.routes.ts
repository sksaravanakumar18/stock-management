import { Routes } from '@angular/router';

import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';

import { CategoryMasterComponent } from './pages/masters/category-master/category-master.component';
import { DepartmentMasterComponent } from './pages/masters/department-master/department-master.component';
import { ProductMasterComponent } from './pages/masters/product-master/product-master.component';
import { SupplierMasterComponent } from './pages/masters/supplier-master/supplier-master.component';
import { CustomerMasterComponent } from './pages/masters/customer-master/customer-master.component';

import { AuditHistoryComponent } from './pages/audit/audit-history/audit-history.component';
import { UserRoleSettingsComponent } from './pages/settings/user-role-settings/user-role-settings.component';
import { RoleManagementPageComponent } from './pages/settings/role-management-page/role-management-page.component';
import { TransactionsPageComponent } from './pages/transactions/transactions-page/transactions-page.component';
import { InwardTransactionPageComponent } from './pages/transactions/inward-transaction-page/inward-transaction-page.component';
import { OutwardTransactionPageComponent } from './pages/transactions/outward-transaction-page/outward-transaction-page.component';
import { ReturnsPageComponent } from './pages/transactions/returns-page/returns-page.component';
import { TransactionDetailPageComponent } from './pages/transactions/transaction-detail-page/transaction-detail-page.component';
import { StockDashboardComponent } from './pages/dashboard/stock-dashboard/stock-dashboard.component';
import { ReportsDashboardComponent } from './pages/reports/reports-dashboard/reports-dashboard.component';

import { SigninFormComponent } from './shared/components/auth/signin-form/signin-form.component';
import { LogoutComponent } from './shared/components/auth/logout/logout.component';

import { authGuard, guestGuard, permissionGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'signin',
    component: SigninFormComponent,
    title: 'Sign In',
    canActivate: [guestGuard],
  },
  {
    path: 'logout',
    component: LogoutComponent,
    title: 'Sign Out',
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: StockDashboardComponent,
        pathMatch: 'full',
        title: 'Stock Overview',
      },
      {
        path: 'masters/categories',
        component: CategoryMasterComponent,
        title: 'Category Master',
      },
      {
        path: 'masters/departments',
        component: DepartmentMasterComponent,
        title: 'Department Master',
      },
      {
        path: 'masters/products',
        component: ProductMasterComponent,
        title: 'Product Master',
      },
      {
        path: 'masters/suppliers',
        component: SupplierMasterComponent,
        title: 'Supplier Master',
      },
      {
        path: 'masters/customers',
        component: CustomerMasterComponent,
        title: 'Customer Master',
      },
      {
        path: 'transactions',
        component: TransactionsPageComponent,
        title: 'Transactions',
      },
      {
        path: 'transactions/inward',
        component: InwardTransactionPageComponent,
        title: 'Stock Inward Transaction',
      },
      {
        path: 'transactions/outward',
        component: OutwardTransactionPageComponent,
        title: 'Stock Outward Transaction',
      },
      {
        path: 'transactions/returns',
        component: ReturnsPageComponent,
        title: 'Returns / Cancellations / Rejections',
      },
      {
        path: 'transactions/:id',
        component: TransactionDetailPageComponent,
        title: 'Transaction Details',
      },
      {
        path: 'audit/history',
        component: AuditHistoryComponent,
        title: 'Audit History',
      },
      {
        path: 'reports',
        component: ReportsDashboardComponent,
        title: 'Reports',
      },
      {
        path: 'settings/users-roles',
        component: UserRoleSettingsComponent,
        title: 'User / Role / Settings',
      },
      {
        path: 'settings/roles',
        component: RoleManagementPageComponent,
        title: 'Role Management',
      },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page Not Found',
  },
];