package com.stockmanagement.stock_management_api.master.transaction.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record StockTransactionRequest(
    String referenceNumber,
    String transactionType,
    UUID vendorId,
    UUID customerId,
    String notes,
    LocalDateTime transactionDate,
    List<TransactionLineItemRequest> lineItems
) {}
