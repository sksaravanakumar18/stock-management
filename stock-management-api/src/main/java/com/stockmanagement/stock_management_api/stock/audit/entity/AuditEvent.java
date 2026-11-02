package com.stockmanagement.stock_management_api.stock.audit.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "audit_event")
public class AuditEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = true)
    private java.util.UUID actorUserId;

    @Column(nullable = false, length = 255)
    private String action;

    @Column(nullable = false, length = 255)
    private String entityType;

    @Column(nullable = true)
    private java.util.UUID entityId;

    @Column(nullable = true, length = 255)
    private String detailsJson;

    @Column(nullable = false)
    private java.time.Instant occurredAt;

    public AuditEvent() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public java.util.UUID getActorUserId() { return actorUserId; }
    public void setActorUserId(java.util.UUID actorUserId) { this.actorUserId = actorUserId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public java.util.UUID getEntityId() { return entityId; }
    public void setEntityId(java.util.UUID entityId) { this.entityId = entityId; }
    public String getDetailsJson() { return detailsJson; }
    public void setDetailsJson(String detailsJson) { this.detailsJson = detailsJson; }
    public java.time.Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(java.time.Instant occurredAt) { this.occurredAt = occurredAt; }
}
