package com.stockmanagement.stock_management_api.master.identity.auth.service;

import com.stockmanagement.stock_management_api.master.identity.auth.dto.LoginRequest;
import com.stockmanagement.stock_management_api.master.identity.auth.dto.LoginResponse;
import com.stockmanagement.stock_management_api.master.identity.auth.security.JwtService;
import com.stockmanagement.stock_management_api.master.identity.permission.repository.PermissionRepository;
import com.stockmanagement.stock_management_api.master.identity.role.repository.RoleRepository;
import com.stockmanagement.stock_management_api.master.identity.rolepermission.repository.RolePermissionRepository;
import com.stockmanagement.stock_management_api.master.identity.user.entity.AppUser;
import com.stockmanagement.stock_management_api.master.identity.user.repository.AppUserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthenticationService {
    private final AppUserRepository users;
    private final RoleRepository roles;
    private final RolePermissionRepository rolePermissions;
    private final PermissionRepository permissions;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(
            AppUserRepository users,
            RoleRepository roles,
            RolePermissionRepository rolePermissions,
            PermissionRepository permissions,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.users = users;
        this.roles = roles;
        this.rolePermissions = rolePermissions;
        this.permissions = permissions;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse authenticate(LoginRequest request) {
        String email = request.email() == null ? "" : request.email().trim();

        AppUser user = users.findByEmailIgnoreCase(email)
                .filter(AppUser::getIsActive)
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        var role = roles.findById(user.getRoleId())
                .filter(com.stockmanagement.stock_management_api.master.identity.role.entity.Role::getIsActive)
                .orElseThrow(this::invalidCredentials);

        List<UUID> permissionIds = rolePermissions.findAllByRoleId(role.getId())
                .stream()
                .map(item -> item.getPermissionId())
                .distinct()
                .toList();

        List<String> permissionCodes = permissions.findAllById(permissionIds)
                .stream()
                .map(item -> item.getCode())
                .sorted()
                .toList();

        return jwtService.createLoginResponse(user, permissionCodes);
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }
}