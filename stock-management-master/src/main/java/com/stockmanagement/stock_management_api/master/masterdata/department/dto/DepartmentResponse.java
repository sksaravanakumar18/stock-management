package com.stockmanagement.stock_management_api.master.masterdata.department.dto;

public record DepartmentResponse(
    java.util.UUID id,
    String name,
    String code,
    String location,
    String description,
    boolean isActive
) {}
