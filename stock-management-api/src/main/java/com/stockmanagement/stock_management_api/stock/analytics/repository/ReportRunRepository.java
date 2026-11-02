package com.stockmanagement.stock_management_api.stock.analytics.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import com.stockmanagement.stock_management_api.stock.analytics.entity.ReportRun;

public interface ReportRunRepository extends JpaRepository<ReportRun, UUID> {}
