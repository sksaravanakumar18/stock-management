package com.stockmanagement.stock_management_api.master.audit.repository;

import com.stockmanagement.stock_management_api.master.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByEntityId(UUID entityId);

    List<AuditLog> findByEntityType(String entityType);

    List<AuditLog> findByOperationType(String operationType);

    List<AuditLog> findByUserId(UUID userId);

    @Query("""
        SELECT al FROM AuditLog al
        WHERE (:entityType IS NULL OR al.entityType = :entityType)
          AND (:operationType IS NULL OR al.operationType = :operationType)
          AND (:userId IS NULL OR al.userId = :userId)
          AND al.timestamp >= :startDate
          AND al.timestamp <= :endDate
        ORDER BY al.timestamp DESC
    """)
    List<AuditLog> findFiltered(
            @Param("entityType") String entityType,
            @Param("operationType") String operationType,
            @Param("userId") UUID userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
