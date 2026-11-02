// src/app/shared/config/master-page.config.ts
import { DynamicFormField } from '../components/form/dynamic-form/dynamic-form.component';
import { DynamicGridColumn } from '../components/tables/dynamic-grid/dynamic-grid.component';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiCallConfig {
    method: ApiMethod;
    url: string;
}

export interface MasterFormField extends DynamicFormField {
    colSpan?: 1 | 2;
}

export interface MasterPageConfig {
    title: string;
    layout: 'side-by-side' | 'modal';
    api: {
        get: ApiCallConfig;
        dataTable: ApiCallConfig;
        post: ApiCallConfig;
        put: ApiCallConfig;
        delete: ApiCallConfig;
    };
    rowKey: string;
    columns: DynamicGridColumn[];
    form: {
        columns: 1 | 2;
        fields: MasterFormField[];
    };
}

export const categoryMasterConfig: MasterPageConfig = {
    title: 'Category Master',
    layout: 'side-by-side',
    rowKey: 'id',

    api: {
        get: { method: 'GET', url: '/api/categories' },
        dataTable: { method: 'GET', url: '/api/categories/datatable' },
        post: { method: 'POST', url: '/api/categories' },
        put: { method: 'PUT', url: '/api/categories/:id' },
        delete: { method: 'DELETE', url: '/api/categories/:id' },
    },

    columns: [
        { key: 'name', label: 'Category', sortable: true },
        { key: 'code', label: 'Code', sortable: true },
        { key: 'description', label: 'Description' },
        {
            key: 'isActive',
            label: 'Status',
            type: 'badge',
            badgeTones: {
                'Active': 'success',
                'Inactive': 'neutral'
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            type: 'actions',
            actions: [
                { id: 'edit', label: 'Edit', variant: 'brand' },
                { id: 'delete', label: 'Delete', variant: 'danger' },
            ],
        },
    ],

    form: {
        columns: 1,
        fields: [
            {
                name: 'name',
                type: 'text',
                label: 'Category name',
                placeholder: 'e.g. Electrical',
                required: true,
            },
            {
                name: 'code',
                type: 'text',
                label: 'Category code',
                placeholder: 'e.g. ELEC',
                hint: 'Optional; auto-generated when left empty',
            },
            {
                name: 'description',
                type: 'textarea',
                label: 'Description',
                placeholder: 'Optional description',
            },
            {
                name: 'isActive',
                type: 'switch',
                label: 'Active',
                value: true,
            },
        ],
    },
};

export const departmentMasterConfig: MasterPageConfig = {
    title: 'Department Master',
    layout: 'side-by-side',
    rowKey: 'id',
    api: {
        get: { method: 'GET', url: '/api/departments' },
        dataTable: { method: 'GET', url: '/api/departments/datatable' },
        post: { method: 'POST', url: '/api/departments' },
        put: { method: 'PUT', url: '/api/departments/:id' },
        delete: { method: 'DELETE', url: '/api/departments/:id' },
    },
    columns: [
        { key: 'name', label: 'Department', sortable: true },
        { key: 'code', label: 'Code', sortable: true },
        { key: 'location', label: 'Location' },
        {
            key: 'isActive',
            label: 'Status',
            type: 'badge',
            badgeTones: { Active: 'success', Inactive: 'neutral' },
        },
        {
            key: 'actions',
            label: 'Actions',
            type: 'actions',
            actions: [
                { id: 'edit', label: 'Edit', variant: 'brand' },
                { id: 'delete', label: 'Delete', variant: 'danger' },
            ],
        },
    ],
    form: {
        columns: 1,
        fields: [
            { name: 'name', type: 'text', label: 'Department name', placeholder: 'e.g. Main Warehouse', required: true },
            { name: 'code', type: 'text', label: 'Department code', placeholder: 'e.g. WH-01', required: true },
            { name: 'location', type: 'text', label: 'Location', placeholder: 'e.g. Building A, Floor 1' },
            { name: 'description', type: 'textarea', label: 'Description', placeholder: 'Optional description' },
            { name: 'isActive', type: 'switch', label: 'Active', value: true },
        ],
    },
};

export const productMasterConfig: MasterPageConfig = {
    title: 'Product Master',
    layout: 'modal',
    rowKey: 'id',

    api: {
        get: { method: 'GET', url: '/api/products' },
        dataTable: { method: 'GET', url: '/api/products/datatable' },
        post: { method: 'POST', url: '/api/products' },
        put: { method: 'PUT', url: '/api/products/:id' },
        delete: { method: 'DELETE', url: '/api/products/:id' },
    },

    columns: [
        { key: 'sku', label: 'SKU', sortable: true },
        { key: 'name', label: 'Product', sortable: true },
        { key: 'category', label: 'Category' },
        { key: 'department', label: 'Department' },
        { key: 'unit', label: 'Unit' },
        { key: 'salesPrice', label: 'Sales price', type: 'number' },
        { key: 'stock', label: 'Stock on hand', type: 'number' },
        {
            key: 'isActive',
            label: 'Status',
            type: 'badge',
            badgeTones: { Active: 'success', Inactive: 'neutral' },
        },
        {
            key: 'actions',
            label: 'Actions',
            type: 'actions',
            actions: [
                { id: 'edit', label: 'Edit', variant: 'brand' },
                { id: 'delete', label: 'Delete', variant: 'danger' },
            ],
        },
    ],

    form: {
        columns: 2,
        fields: [
            { name: 'sku', type: 'text', label: 'SKU', required: true },
            { name: 'name', type: 'text', label: 'Product name', required: true },
            {
                name: 'categoryId',
                type: 'select',
                label: 'Category',
                placeholder: 'Select category',
                required: true,
                options: [],
            },
            {
                name: 'departmentId',
                type: 'select',
                label: 'Department',
                placeholder: 'Select department',
                options: [],
            },
            {
                name: 'unit',
                type: 'select',
                label: 'Unit of measure',
                required: true,
                options: [
                    { value: 'kg', label: 'kg' },
                    { value: 'lit', label: 'lit' },
                    { value: 'piece', label: 'piece' },
                    { value: 'box', label: 'box' },
                ],
            },
            {
                name: 'taxType',
                type: 'select',
                label: 'Tax type',
                options: [
                    { value: 'NONE', label: 'No tax' },
                    { value: 'GST', label: 'GST' },
                    { value: 'VAT', label: 'VAT' },
                ],
            },
            {
                name: 'purchasePrice',
                type: 'number',
                label: 'Default purchase price',
                value: 0,
                min: '0',
                step: 0.01,
            },
            {
                name: 'salesPrice',
                type: 'number',
                label: 'Default sales price',
                value: 0,
                min: '0',
                step: 0.01,
            },
            {
                name: 'description',
                type: 'textarea',
                label: 'Description',
                colSpan: 2,
            },
            { name: 'isActive', type: 'switch', label: 'Active', value: true, colSpan: 2 },
        ],
    },
};

export const supplierMasterConfig: MasterPageConfig = {
    title: 'Supplier Master',
    layout: 'side-by-side',
    rowKey: 'id',
    api: {
        get: { method: 'GET', url: '/api/suppliers' },
        dataTable: { method: 'GET', url: '/api/suppliers/datatable' },
        post: { method: 'POST', url: '/api/suppliers' },
        put: { method: 'PUT', url: '/api/suppliers/:id' },
        delete: { method: 'DELETE', url: '/api/suppliers/:id' },
    },
    columns: [
        { key: 'name', label: 'Supplier', sortable: true },
        { key: 'code', label: 'Code', sortable: true },
        { key: 'contactPerson', label: 'Contact' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'taxId', label: 'Tax ID' },
        {
            key: 'isActive',
            label: 'Status',
            type: 'badge',
            badgeTones: { Active: 'success', Inactive: 'neutral' },
        },
        {
            key: 'actions',
            label: 'Actions',
            type: 'actions',
            actions: [
                { id: 'edit', label: 'Edit', variant: 'brand' },
                { id: 'delete', label: 'Delete', variant: 'danger' },
            ],
        },
    ],
    form: {
        columns: 1,
        fields: [
            { name: 'code', type: 'text', label: 'Supplier code', placeholder: 'e.g. SUP-001', required: true },
            { name: 'name', type: 'text', label: 'Supplier name', placeholder: 'Company or supplier name', required: true },
            { name: 'contactPerson', type: 'text', label: 'Contact person' },
            { name: 'phone', type: 'tel', label: 'Phone' },
            { name: 'email', type: 'email', label: 'Email' },
            { name: 'taxId', type: 'text', label: 'GST / VAT registration number' },
            { name: 'address', type: 'textarea', label: 'Address', rows: 3 },
            { name: 'isActive', type: 'switch', label: 'Active', value: true },
        ],
    },
};

export const customerMasterConfig: MasterPageConfig = {
    title: 'Customer Master',
    layout: 'side-by-side',
    rowKey: 'id',
    api: {
        get: { method: 'GET', url: '/api/customers' },
        dataTable: { method: 'GET', url: '/api/customers/datatable' },
        post: { method: 'POST', url: '/api/customers' },
        put: { method: 'PUT', url: '/api/customers/:id' },
        delete: { method: 'DELETE', url: '/api/customers/:id' },
    },
    columns: [
        { key: 'name', label: 'Customer', sortable: true },
        { key: 'code', label: 'Code', sortable: true },
        { key: 'type', label: 'Type' },
        { key: 'contactPerson', label: 'Contact' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        {
            key: 'isActive',
            label: 'Status',
            type: 'badge',
            badgeTones: { Active: 'success', Inactive: 'neutral' },
        },
        {
            key: 'actions',
            label: 'Actions',
            type: 'actions',
            actions: [
                { id: 'edit', label: 'Edit', variant: 'brand' },
                { id: 'delete', label: 'Delete', variant: 'danger' },
            ],
        },
    ],
    form: {
        columns: 1,
        fields: [
            {
                name: 'type',
                type: 'select',
                label: 'Customer type',
                value: 'BUSINESS',
                options: [
                    { value: 'BUSINESS', label: 'Business' },
                    { value: 'INDIVIDUAL', label: 'Individual' },
                ],
            },
            { name: 'code', type: 'text', label: 'Customer code', placeholder: 'e.g. CUS-001', required: true },
            { name: 'name', type: 'text', label: 'Customer name', placeholder: 'Customer or company name', required: true },
            { name: 'contactPerson', type: 'text', label: 'Contact person' },
            { name: 'phone', type: 'tel', label: 'Phone' },
            { name: 'email', type: 'email', label: 'Email' },
            { name: 'taxId', type: 'text', label: 'GST / VAT registration number' },
            { name: 'address', type: 'textarea', label: 'Billing or delivery address', rows: 3 },
            { name: 'isActive', type: 'switch', label: 'Active', value: true },
        ],
    },
};