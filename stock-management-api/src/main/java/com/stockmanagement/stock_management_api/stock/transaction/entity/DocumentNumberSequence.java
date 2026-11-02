package com.stockmanagement.stock_management_api.stock.transaction.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "document_number_sequence")
public class DocumentNumberSequence {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String documentType;

    @Column(nullable = false, length = 255)
    private String prefix;

    @Column(nullable = false)
    private long nextValue;

    public DocumentNumberSequence() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getPrefix() { return prefix; }
    public void setPrefix(String prefix) { this.prefix = prefix; }
    public long getNextValue() { return nextValue; }
    public void setNextValue(long nextValue) { this.nextValue = nextValue; }
}
