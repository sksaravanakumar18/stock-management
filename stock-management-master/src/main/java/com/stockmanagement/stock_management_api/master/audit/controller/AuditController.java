package com.stockmanagement.stock_management_api.master.audit.controller;

import com.stockmanagement.stock_management_api.master.audit.dto.AuditLogResponse;
import com.stockmanagement.stock_management_api.master.audit.service.AuditService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit-history")
public class AuditController {
    private final AuditService service;

    public AuditController(AuditService service) {
        this.service = service;
    }

    @GetMapping
    public List<AuditLogResponse> findFiltered(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        LocalDateTime start = startDate != null ? startDate : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = endDate != null ? endDate : LocalDateTime.now();

        return service.findFiltered(entityType, operationType, userId, start, end);
    }

    @GetMapping("/entity/{entityId}")
    public List<AuditLogResponse> findByEntityId(@PathVariable UUID entityId) {
        return service.findByEntityId(entityId);
    }

    @GetMapping("/entity-type/{entityType}")
    public List<AuditLogResponse> findByEntityType(@PathVariable String entityType) {
        return service.findByEntityType(entityType);
    }

    @GetMapping("/operation/{operationType}")
    public List<AuditLogResponse> findByOperationType(@PathVariable String operationType) {
        return service.findByOperationType(operationType);
    }

    @GetMapping("/user/{userId}")
    public List<AuditLogResponse> findByUserId(@PathVariable UUID userId) {
        return service.findByUserId(userId);
    }
}
