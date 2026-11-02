package com.stockmanagement.stock_management_api.stock.common.api;

import java.time.Instant;

public record ApiError(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path
) {}
