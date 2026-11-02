package com.stockmanagement.stock_management_api.master.masterdata.supplier.dto;

public record SupplierRequest(
    String code,
    String name,
    String contactPerson,
    String phone,
    String email,
    String taxId,
    String address,
    boolean isActive
) {}
