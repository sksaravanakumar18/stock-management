package com.stockmanagement.stock_management_api.master.report.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record StockMovementReport(
    UUID productId,
    String productName,
    String movementType,
    BigDecimal quantity,
    BigDecimal runningBalance,
    LocalDateTime movementDate,
    String remarks
) {}
