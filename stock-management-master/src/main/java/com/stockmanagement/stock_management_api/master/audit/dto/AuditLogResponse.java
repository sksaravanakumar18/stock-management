package com.stockmanagement.stock_management_api.master.audit.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AuditLogResponse(
    UUID id,
    String operationType,
    String entityType,
    UUID entityId,
    UUID userId,
    String beforeValues,
    String afterValues,
    LocalDateTime timestamp,
    String description
) {}
