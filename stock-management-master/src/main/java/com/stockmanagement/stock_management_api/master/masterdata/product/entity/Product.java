package com.stockmanagement.stock_management_api.master.masterdata.product.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String sku;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false)
    private java.util.UUID categoryId;

    @Column(nullable = true)
    private java.util.UUID departmentId;

    @Column(nullable = false, length = 255)
    private String unit;

    @Column(nullable = false, precision = 19, scale = 4)
    private java.math.BigDecimal purchasePrice;

    @Column(nullable = false, precision = 19, scale = 4)
    private java.math.BigDecimal salesPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.stockmanagement.stock_management_api.master.common.enums.TaxType taxType;

    @Column(nullable = false, precision = 19, scale = 4)
    private java.math.BigDecimal taxRate;

    @Column(nullable = false, precision = 19, scale = 4)
    private java.math.BigDecimal reorderLevel;

    @Column(nullable = false)
    private boolean isActive;

    public Product() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public java.util.UUID getCategoryId() { return categoryId; }
    public void setCategoryId(java.util.UUID categoryId) { this.categoryId = categoryId; }
    public java.util.UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(java.util.UUID departmentId) { this.departmentId = departmentId; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public java.math.BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(java.math.BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }
    public java.math.BigDecimal getSalesPrice() { return salesPrice; }
    public void setSalesPrice(java.math.BigDecimal salesPrice) { this.salesPrice = salesPrice; }
    public com.stockmanagement.stock_management_api.master.common.enums.TaxType getTaxType() { return taxType; }
    public void setTaxType(com.stockmanagement.stock_management_api.master.common.enums.TaxType taxType) { this.taxType = taxType; }
    public java.math.BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(java.math.BigDecimal taxRate) { this.taxRate = taxRate; }
    public java.math.BigDecimal getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(java.math.BigDecimal reorderLevel) { this.reorderLevel = reorderLevel; }
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
}
