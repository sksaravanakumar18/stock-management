package com.stockmanagement.stock_management_api.master.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record RecentTransaction(
    UUID id,
    String referenceNumber,
    String transactionType,
    BigDecimal amount,
    LocalDateTime transactionDate
) {}
