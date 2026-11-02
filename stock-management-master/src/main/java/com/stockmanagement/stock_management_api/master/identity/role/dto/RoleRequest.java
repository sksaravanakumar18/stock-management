package com.stockmanagement.stock_management_api.master.identity.role.dto;

public record RoleRequest(
    String name,
    String description,
    boolean builtIn,
    boolean isActive
) {}
