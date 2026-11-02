package com.stockmanagement.stock_management_api.master.audit.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String operationType; // CREATE, UPDATE, DELETE, READ

    @Column(nullable = false, length = 100)
    private String entityType;

    @Column(nullable = false)
    private UUID entityId;

    @Column(nullable = true)
    private UUID userId;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String beforeValues;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String afterValues;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = true, length = 500)
    private String description;

    public AuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getOperationType() { return operationType; }
    public void setOperationType(String operationType) { this.operationType = operationType; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getBeforeValues() { return beforeValues; }
    public void setBeforeValues(String beforeValues) { this.beforeValues = beforeValues; }
    public String getAfterValues() { return afterValues; }
    public void setAfterValues(String afterValues) { this.afterValues = afterValues; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
