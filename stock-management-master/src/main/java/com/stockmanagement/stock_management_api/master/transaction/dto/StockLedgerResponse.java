package com.stockmanagement.stock_management_api.master.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record StockLedgerResponse(
    UUID id,
    UUID productId,
    String movementType,
    BigDecimal quantity,
    BigDecimal runningBalance,
    UUID transactionId,
    LocalDateTime movementDate,
    String remarks
) {}
