package com.stockmanagement.stock_management_api.master.identity.permission.dto;

public record PermissionResponse(
    java.util.UUID id,
    String code,
    String label,
    String groupName
) {}
