package com.stockmanagement.stock_management_api.master.dashboard.dto;

import java.time.LocalDate;

public record InventoryMovement(
    LocalDate date,
    long inbound,
    long outbound,
    long adjustments
) {}
