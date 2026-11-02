package com.stockmanagement.stock_management_api.master.dashboard.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record StockLevel(
    UUID productId,
    String productName,
    BigDecimal currentStock,
    BigDecimal reorderLevel,
    String status
) {}
