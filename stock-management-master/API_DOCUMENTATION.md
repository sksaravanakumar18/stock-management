# Stock Management API Documentation

## Overview
This is a comprehensive Stock Management application built with Spring Boot that provides complete transaction processing, audit trails, reporting, and dashboard functionality.

## Features Implemented

### ✅ CRITICAL ISSUES FIXED

#### Issue 1: Category Create Returns 500 Error - FIXED
- **Problem**: POST /api/v1/categories was returning HTTP 500 due to NULL code field
- **Solution**: Auto-generate code from categoryName using first 4 characters
- **Files Modified**: 
  - CategoryService.java
  - CategoryRequest.java

#### Issue 2: Category Filter Returns All Records - FIXED
- **Problem**: Category filter was not applying WHERE clause
- **Solution**: Verified CategoryRepository.findFiltered() correctly uses status filter

#### Applied Same Fixes To:
- DepartmentService - auto-generate code from name
- CustomerService - auto-generate code from name
- SupplierService - auto-generate code from name
- ProductService - auto-generate SKU from name

---

## API ENDPOINTS

### 1. CATEGORY MANAGEMENT
```
GET    /api/v1/categories                    # Get all categories (with optional filters)
GET    /api/v1/categories/{id}               # Get category by ID
POST   /api/v1/categories                    # Create category (auto-generates code)
PUT    /api/v1/categories/{id}               # Update category
DELETE /api/v1/categories/{id}               # Delete category (soft delete)
```

**Query Parameters for GET /api/v1/categories:**
- `status`: "ACTIVE", "INACTIVE", or "ALL" (default: "ALL")
- `search`: Search by name, code, or description

**Example Request:**
```json
POST /api/v1/categories
{
  "name": "Electronics",
  "description": "Electronic items"
}
```
Code will be auto-generated as "ELEC"

---

### 2. DEPARTMENT MANAGEMENT
```
GET    /api/v1/departments                   # Get all departments
GET    /api/v1/departments/{id}              # Get department by ID
POST   /api/v1/departments                   # Create department
PUT    /api/v1/departments/{id}              # Update department
DELETE /api/v1/departments/{id}              # Delete department
```

---

### 3. CUSTOMER MANAGEMENT
```
GET    /api/v1/customers                     # Get all customers
GET    /api/v1/customers/{id}                # Get customer by ID
POST   /api/v1/customers                     # Create customer
PUT    /api/v1/customers/{id}                # Update customer
DELETE /api/v1/customers/{id}                # Delete customer
```

---

### 4. SUPPLIER MANAGEMENT
```
GET    /api/v1/suppliers                     # Get all suppliers
GET    /api/v1/suppliers/{id}                # Get supplier by ID
POST   /api/v1/suppliers                     # Create supplier
PUT    /api/v1/suppliers/{id}                # Update supplier
DELETE /api/v1/suppliers/{id}                # Delete supplier
```

---

### 5. PRODUCT MANAGEMENT
```
GET    /api/v1/products                      # Get all products
GET    /api/v1/products/{id}                 # Get product by ID
POST   /api/v1/products                      # Create product
PUT    /api/v1/products/{id}                 # Update product
DELETE /api/v1/products/{id}                 # Delete product
```

---

### 6. TRANSACTION MANAGEMENT ⭐ NEW

#### Stock Transactions
```
GET    /api/v1/stock-transactions            # Get all transactions
GET    /api/v1/stock-transactions/{id}       # Get transaction by ID
POST   /api/v1/stock-transactions            # Create transaction (INWARD/OUTWARD/etc)
PUT    /api/v1/stock-transactions/{id}       # Update transaction
DELETE /api/v1/stock-transactions/{id}       # Delete transaction
```

**Transaction Types Supported:**
- INWARD - Stock received from vendor
- OUTWARD - Stock issued/sold
- RETURN - Customer/Vendor return
- CANCEL - Cancel transaction
- REJECT - Reject received stock
- DISPATCH - Dispatch to customer
- ORDERED - Place order

**Example Request:**
```json
POST /api/v1/stock-transactions
{
  "referenceNumber": "TXN-2024-001",
  "transactionType": "INWARD",
  "vendorId": "uuid-of-vendor",
  "notes": "Stock received from supplier",
  "transactionDate": "2024-11-01T10:30:00",
  "lineItems": [
    {
      "productId": "uuid-of-product",
      "quantity": 100,
      "unitPrice": 25.50,
      "discount": 2.50
    }
  ]
}
```

---

### 7. AUDIT TRAIL ⭐ NEW

```
GET    /api/v1/audit-history                 # Get audit history (with filters)
GET    /api/v1/audit-history/entity/{id}     # Get audit for specific entity
GET    /api/v1/audit-history/entity-type/{type}  # Get audit by entity type
GET    /api/v1/audit-history/operation/{op}  # Get audit by operation type
GET    /api/v1/audit-history/user/{userId}   # Get audit by user
```

**Query Parameters for Audit History:**
- `entityType`: Type of entity (Category, Product, etc)
- `operationType`: CREATE, UPDATE, DELETE, READ
- `userId`: User who performed the action
- `startDate`: Start date for filtering
- `endDate`: End date for filtering

**Automatic Logging Captures:**
- Operation type (CREATE/UPDATE/DELETE)
- Entity type and ID
- User ID who performed action
- Before and after values (as JSON)
- Timestamp

---

### 8. USER MANAGEMENT ⭐ NEW

```
GET    /api/v1/users                         # Get all users
GET    /api/v1/users?active=true              # Get active users
GET    /api/v1/users/{id}                    # Get user by ID
GET    /api/v1/users/email/{email}           # Get user by email
POST   /api/v1/users                         # Create user
PUT    /api/v1/users/{id}                    # Update user
DELETE /api/v1/users/{id}                    # Delete user (soft delete)
POST   /api/v1/users/{id}/activate           # Activate user
POST   /api/v1/users/{id}/deactivate         # Deactivate user
```

**Example Request:**
```json
POST /api/v1/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "roleId": "uuid-of-role",
  "departmentId": "uuid-of-department",
  "isActive": true
}
```

---

### 9. REPORTING ENGINE ⭐ NEW

```
GET    /api/v1/reports/stock-summary         # Stock value and count summary
GET    /api/v1/reports/movement              # Movement report (with date range)
GET    /api/v1/reports/purchases             # Purchase report
GET    /api/v1/reports/dispatch              # Dispatch report
GET    /api/v1/reports/exceptions            # Exception report
GET    /api/v1/reports/tax                   # Tax report
GET    /api/v1/reports/export-csv            # Export data as CSV
```

**Query Parameters for Reports:**
- `startDate`: Start date (ISO 8601 format)
- `endDate`: End date (ISO 8601 format)

**Stock Summary Response:**
```json
{
  "totalProducts": 250,
  "totalCategories": 15,
  "totalStockValue": 125000.00,
  "lowStockItems": 12,
  "outOfStockItems": 3
}
```

---

### 10. DASHBOARD METRICS ⭐ NEW

```
GET    /api/v1/dashboard/summary             # Dashboard summary metrics
GET    /api/v1/dashboard/levels              # Current stock levels
GET    /api/v1/dashboard/transactions        # Recent transactions
GET    /api/v1/dashboard/alerts              # Alerts and warnings
```

**Dashboard Summary:**
```json
{
  "totalProducts": 250,
  "totalStockValue": 125000.00,
  "activeTransactions": 45,
  "usersOnline": 5
}
```

**Stock Levels:**
```json
[
  {
    "productId": "uuid",
    "productName": "Widget A",
    "currentStock": 50,
    "reorderLevel": 25,
    "status": "NORMAL"
  },
  {
    "productId": "uuid",
    "productName": "Widget B",
    "currentStock": 5,
    "reorderLevel": 25,
    "status": "LOW"
  }
]
```

---

## DATABASE TABLES

### stock_transaction
Stores all stock movement transactions

### transaction_line_item
Line items within transactions (products and quantities)

### stock_ledger
Maintains running balance of stock for each product

### audit_log
Complete audit trail of all operations

---

## Key Features

### ✅ Auto-Code Generation
All master data entities (Category, Department, Customer, Supplier, Product) automatically generate codes from names if not provided.

### ✅ Stock Ledger
Real-time stock level tracking with movement history

### ✅ Audit Trail
Complete audit trail of all CRUD operations with before/after values

### ✅ Transaction Management
Comprehensive transaction processing with multiple transaction types

### ✅ Reporting
Multiple report types including CSV export

### ✅ Dashboard
Real-time metrics and alerts

### ✅ User Management
Complete user lifecycle management with roles

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200 OK - Successful GET/PUT
- 201 CREATED - Successful POST
- 204 NO CONTENT - Successful DELETE
- 400 BAD REQUEST - Invalid input
- 404 NOT FOUND - Resource not found
- 409 CONFLICT - Business logic violation
- 500 INTERNAL SERVER ERROR - Server error

---

## Running the Application

```bash
mvn clean compile
mvn spring-boot:run
```

Database migrations will run automatically via Flyway.

---

## Next Steps for Enhancement

1. Implement authentication/authorization
2. Add file upload support for bulk import
3. Implement batch processing for large reports
4. Add notifications/alerts system
5. Create mobile app
6. Add inventory forecasting
7. Implement barcode scanning
8. Add multi-warehouse support

