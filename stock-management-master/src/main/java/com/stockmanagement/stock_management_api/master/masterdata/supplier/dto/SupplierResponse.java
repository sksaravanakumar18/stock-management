package com.stockmanagement.stock_management_api.master.masterdata.supplier.dto;

public record SupplierResponse(
    java.util.UUID id,
    String code,
    String name,
    String contactPerson,
    String phone,
    String email,
    String taxId,
    String address,
    boolean isActive
) {}
