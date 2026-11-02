package com.stockmanagement.stock_management_api.master.report.dto;

import java.math.BigDecimal;

public record StockSummaryReport(
    long totalProducts,
    long totalCategories,
    BigDecimal totalStockValue,
    long lowStockItems,
    long outOfStockItems
) {}
