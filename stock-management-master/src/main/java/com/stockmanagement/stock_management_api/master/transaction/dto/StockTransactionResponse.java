package com.stockmanagement.stock_management_api.master.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record StockTransactionResponse(
    UUID id,
    String referenceNumber,
    String transactionType,
    UUID vendorId,
    UUID customerId,
    String notes,
    LocalDateTime transactionDate,
    BigDecimal totalAmount,
    boolean isActive,
    LocalDateTime createdAt,
    List<TransactionLineItemResponse> lineItems
) {}
