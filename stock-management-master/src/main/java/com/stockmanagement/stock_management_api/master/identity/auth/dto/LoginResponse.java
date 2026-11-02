package com.stockmanagement.stock_management_api.master.identity.auth.dto;

import java.time.Instant;
import java.util.List;

public record LoginResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        UserInfo user
) {
    public record UserInfo(
            String id,
            String name,
            String email,
            String roleId,
            String departmentId,
            boolean isActive,
            List<String> permissions
    ) {}
}