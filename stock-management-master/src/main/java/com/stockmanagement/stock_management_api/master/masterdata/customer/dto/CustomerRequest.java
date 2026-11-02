package com.stockmanagement.stock_management_api.master.masterdata.customer.dto;

public record CustomerRequest(
    String code,
    String name,
    com.stockmanagement.stock_management_api.master.common.enums.CustomerType type,
    String contactPerson,
    String phone,
    String email,
    String taxId,
    String address,
    boolean isActive
) {}
