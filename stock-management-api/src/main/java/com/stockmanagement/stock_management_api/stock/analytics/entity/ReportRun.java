package com.stockmanagement.stock_management_api.stock.analytics.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "report_run")
public class ReportRun {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.stockmanagement.stock_management_api.stock.common.enums.ReportType reportType;

    @Column(nullable = true)
    private java.util.UUID generatedBy;

    @Column(nullable = true, length = 255)
    private String filtersJson;

    @Column(nullable = false)
    private java.time.Instant generatedAt;

    public ReportRun() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public com.stockmanagement.stock_management_api.stock.common.enums.ReportType getReportType() { return reportType; }
    public void setReportType(com.stockmanagement.stock_management_api.stock.common.enums.ReportType reportType) { this.reportType = reportType; }
    public java.util.UUID getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(java.util.UUID generatedBy) { this.generatedBy = generatedBy; }
    public String getFiltersJson() { return filtersJson; }
    public void setFiltersJson(String filtersJson) { this.filtersJson = filtersJson; }
    public java.time.Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(java.time.Instant generatedAt) { this.generatedAt = generatedAt; }
}
