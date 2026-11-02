package com.stockmanagement.stock_management_api.stock.audit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import com.stockmanagement.stock_management_api.stock.audit.entity.AuditEvent;

public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {}
