package com.stockmanagement.stock_management_api.stock.inventory.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "stock_ledger_entry")
public class StockLedgerEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private java.util.UUID transactionId;

    @Column(nullable = false)
    private java.util.UUID transactionLineId;

    @Column(nullable = false)
    private java.util.UUID productId;

    @Column(nullable = true)
    private java.util.UUID departmentId;

    @Column(nullable = false, precision = 19, scale = 4)
    private java.math.BigDecimal quantityDelta;

    @Column(nullable = false)
    private java.time.Instant occurredAt;

    public StockLedgerEntry() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public java.util.UUID getTransactionId() { return transactionId; }
    public void setTransactionId(java.util.UUID transactionId) { this.transactionId = transactionId; }
    public java.util.UUID getTransactionLineId() { return transactionLineId; }
    public void setTransactionLineId(java.util.UUID transactionLineId) { this.transactionLineId = transactionLineId; }
    public java.util.UUID getProductId() { return productId; }
    public void setProductId(java.util.UUID productId) { this.productId = productId; }
    public java.util.UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(java.util.UUID departmentId) { this.departmentId = departmentId; }
    public java.math.BigDecimal getQuantityDelta() { return quantityDelta; }
    public void setQuantityDelta(java.math.BigDecimal quantityDelta) { this.quantityDelta = quantityDelta; }
    public java.time.Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(java.time.Instant occurredAt) { this.occurredAt = occurredAt; }
}
