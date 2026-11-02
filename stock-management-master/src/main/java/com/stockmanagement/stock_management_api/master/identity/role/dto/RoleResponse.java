package com.stockmanagement.stock_management_api.master.identity.role.dto;

public record RoleResponse(
    java.util.UUID id,
    String name,
    String description,
    boolean builtIn,
    boolean isActive
) {}
