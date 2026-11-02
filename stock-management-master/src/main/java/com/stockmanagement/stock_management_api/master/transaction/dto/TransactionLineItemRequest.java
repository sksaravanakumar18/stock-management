package com.stockmanagement.stock_management_api.master.transaction.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TransactionLineItemRequest(
    UUID productId,
    BigDecimal quantity,
    BigDecimal unitPrice,
    BigDecimal discount
) {}
