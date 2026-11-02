package com.stockmanagement.stock_management_api.master.masterdata.department.dto;

public record DepartmentRequest(
    String name,
    String code,
    String location,
    String description,
    boolean isActive
) {}
