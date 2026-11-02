package com.stockmanagement.stock_management_api.master.identity.user.dto;

import java.util.UUID;

public record UserRequest(
    String name,
    String email,
    String password,
    UUID roleId,
    UUID departmentId,
    boolean isActive
) {}
