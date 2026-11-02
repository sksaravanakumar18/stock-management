package com.stockmanagement.stock_management_api.master.dashboard.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionAlert(
    UUID id,
    String type,
    String message,
    LocalDateTime timestamp,
    String severity
) {}
