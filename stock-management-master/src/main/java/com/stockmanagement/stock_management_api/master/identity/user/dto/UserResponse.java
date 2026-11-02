package com.stockmanagement.stock_management_api.master.identity.user.dto;

import java.util.UUID;

public record UserResponse(
    UUID id,
    String name,
    String email,
    UUID roleId,
    UUID departmentId,
    boolean isActive
) {}
