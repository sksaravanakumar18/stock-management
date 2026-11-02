package com.stockmanagement.stock_management_api.master.audit.service;

import com.stockmanagement.stock_management_api.master.audit.dto.AuditLogResponse;
import com.stockmanagement.stock_management_api.master.audit.entity.AuditLog;
import com.stockmanagement.stock_management_api.master.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuditService {
    private final AuditLogRepository repository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditLogRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void logOperation(String operationType, String entityType, UUID entityId, UUID userId,
                            Object beforeValues, Object afterValues, String description) {
        AuditLog log = new AuditLog();
        log.setOperationType(operationType);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setUserId(userId);
        log.setDescription(description);
        log.setTimestamp(LocalDateTime.now());

        try {
            if (beforeValues != null) {
                log.setBeforeValues(objectMapper.writeValueAsString(beforeValues));
            }
            if (afterValues != null) {
                log.setAfterValues(objectMapper.writeValueAsString(afterValues));
            }
        } catch (Exception e) {
            log.setBeforeValues(beforeValues != null ? beforeValues.toString() : null);
            log.setAfterValues(afterValues != null ? afterValues.toString() : null);
        }

        repository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findByEntityId(UUID entityId) {
        return repository.findByEntityId(entityId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findByEntityType(String entityType) {
        return repository.findByEntityType(entityType)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findByOperationType(String operationType) {
        return repository.findByOperationType(operationType)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findByUserId(UUID userId) {
        return repository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findFiltered(String entityType, String operationType, UUID userId,
                                              LocalDateTime startDate, LocalDateTime endDate) {
        return repository.findFiltered(entityType, operationType, userId, startDate, endDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditLogResponse toResponse(AuditLog entity) {
        return new AuditLogResponse(
                entity.getId(),
                entity.getOperationType(),
                entity.getEntityType(),
                entity.getEntityId(),
                entity.getUserId(),
                entity.getBeforeValues(),
                entity.getAfterValues(),
                entity.getTimestamp(),
                entity.getDescription()
        );
    }
}
