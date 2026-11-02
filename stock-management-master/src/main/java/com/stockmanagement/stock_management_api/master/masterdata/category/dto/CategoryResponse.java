package com.stockmanagement.stock_management_api.master.masterdata.category.dto;

public record CategoryResponse(
    java.util.UUID id,
    String name,
    String code,
    String description,
    boolean isActive
) {}
