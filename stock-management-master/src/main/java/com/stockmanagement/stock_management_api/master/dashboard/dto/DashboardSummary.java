package com.stockmanagement.stock_management_api.master.dashboard.dto;

import java.math.BigDecimal;

public record DashboardSummary(
    long totalProducts,
    BigDecimal totalStockValue,
    long activeTransactions,
    long usersOnline
) {}
