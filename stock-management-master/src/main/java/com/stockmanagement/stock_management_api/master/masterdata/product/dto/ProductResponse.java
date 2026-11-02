package com.stockmanagement.stock_management_api.master.masterdata.product.dto;

public record ProductResponse(
    java.util.UUID id,
    String sku,
    String name,
    java.util.UUID categoryId,
    java.util.UUID departmentId,
    String unit,
    java.math.BigDecimal purchasePrice,
    java.math.BigDecimal salesPrice,
    com.stockmanagement.stock_management_api.master.common.enums.TaxType taxType,
    java.math.BigDecimal taxRate,
    java.math.BigDecimal reorderLevel,
    boolean isActive
) {}
