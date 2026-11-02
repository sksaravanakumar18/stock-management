package com.stockmanagement.stock_management_api.master.transaction.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TransactionLineItemResponse(
    UUID id,
    UUID productId,
    BigDecimal quantity,
    BigDecimal unitPrice,
    BigDecimal discount,
    BigDecimal lineTotal
) {}
