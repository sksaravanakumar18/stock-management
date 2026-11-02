package com.stockmanagement.stock_management_api.stock.transaction.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "stock_transaction_line")
public class StockTransactionLine {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private java.util.UUID transactionId;

    @Column(nullable = false)
    private java.util.UUID productId;

    @Column(nullable = false, length = 255)
    private String sku;

    @Column(nullable = false, length = 255)
    private String productName;

    @Column(nullable = false, precision = 19, scale = 4)
    private java.math.BigDecimal quantity;

    @Column(nullable = false, length = 255)
    private String unit;

    @Column(nullable = false, precision = 19, scale = 4)
    private java.math.BigDecimal unitPrice;

    @Column(nullable = false, precision = 19, scale = 4)
    private java.math.BigDecimal taxRate;

    public StockTransactionLine() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public java.util.UUID getTransactionId() { return transactionId; }
    public void setTransactionId(java.util.UUID transactionId) { this.transactionId = transactionId; }
    public java.util.UUID getProductId() { return productId; }
    public void setProductId(java.util.UUID productId) { this.productId = productId; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public java.math.BigDecimal getQuantity() { return quantity; }
    public void setQuantity(java.math.BigDecimal quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public java.math.BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(java.math.BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public java.math.BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(java.math.BigDecimal taxRate) { this.taxRate = taxRate; }
}
