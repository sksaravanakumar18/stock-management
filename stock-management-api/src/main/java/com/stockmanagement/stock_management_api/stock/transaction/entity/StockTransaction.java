package com.stockmanagement.stock_management_api.stock.transaction.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "stock_transaction")
public class StockTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String documentNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.stockmanagement.stock_management_api.stock.common.enums.TransactionType type;

    @Column(nullable = false)
    private com.stockmanagement.stock_management_api.stock.common.enums.TransactionStatus status;

    @Column(nullable = false)
    private java.time.LocalDate date;

    @Column(nullable = true)
    private java.util.UUID departmentId;

    @Column(nullable = true)
    private java.util.UUID partyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.stockmanagement.stock_management_api.stock.common.enums.PartyType partyType;

    @Column(nullable = true, length = 255)
    private String reference;

    @Column(nullable = true, length = 255)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.stockmanagement.stock_management_api.stock.common.enums.ReturnCondition returnCondition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.stockmanagement.stock_management_api.stock.common.enums.TaxType taxType;

    @Column(nullable = true)
    private java.util.UUID relatedTransactionId;

    @Column(nullable = true)
    private java.util.UUID createdBy;

    public StockTransaction() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getDocumentNo() { return documentNo; }
    public void setDocumentNo(String documentNo) { this.documentNo = documentNo; }
    public com.stockmanagement.stock_management_api.stock.common.enums.TransactionType getType() { return type; }
    public void setType(com.stockmanagement.stock_management_api.stock.common.enums.TransactionType type) { this.type = type; }
    public com.stockmanagement.stock_management_api.stock.common.enums.TransactionStatus getStatus() { return status; }
    public void setStatus(com.stockmanagement.stock_management_api.stock.common.enums.TransactionStatus status) { this.status = status; }
    public java.time.LocalDate getDate() { return date; }
    public void setDate(java.time.LocalDate date) { this.date = date; }
    public java.util.UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(java.util.UUID departmentId) { this.departmentId = departmentId; }
    public java.util.UUID getPartyId() { return partyId; }
    public void setPartyId(java.util.UUID partyId) { this.partyId = partyId; }
    public com.stockmanagement.stock_management_api.stock.common.enums.PartyType getPartyType() { return partyType; }
    public void setPartyType(com.stockmanagement.stock_management_api.stock.common.enums.PartyType partyType) { this.partyType = partyType; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public com.stockmanagement.stock_management_api.stock.common.enums.ReturnCondition getReturnCondition() { return returnCondition; }
    public void setReturnCondition(com.stockmanagement.stock_management_api.stock.common.enums.ReturnCondition returnCondition) { this.returnCondition = returnCondition; }
    public com.stockmanagement.stock_management_api.stock.common.enums.TaxType getTaxType() { return taxType; }
    public void setTaxType(com.stockmanagement.stock_management_api.stock.common.enums.TaxType taxType) { this.taxType = taxType; }
    public java.util.UUID getRelatedTransactionId() { return relatedTransactionId; }
    public void setRelatedTransactionId(java.util.UUID relatedTransactionId) { this.relatedTransactionId = relatedTransactionId; }
    public java.util.UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(java.util.UUID createdBy) { this.createdBy = createdBy; }
}
