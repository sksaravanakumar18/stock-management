package com.stockmanagement.stock_management_api.master.identity.permission.dto;

public record PermissionRequest(
    String code,
    String label,
    String groupName
) {}
