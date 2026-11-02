package com.stockmanagement.stock_management_api.master.identity.bootstrap;

import com.stockmanagement.stock_management_api.master.identity.permission.entity.Permission;
import com.stockmanagement.stock_management_api.master.identity.permission.repository.PermissionRepository;
import com.stockmanagement.stock_management_api.master.identity.role.entity.Role;
import com.stockmanagement.stock_management_api.master.identity.role.repository.RoleRepository;
import com.stockmanagement.stock_management_api.master.identity.rolepermission.entity.RolePermission;
import com.stockmanagement.stock_management_api.master.identity.rolepermission.repository.RolePermissionRepository;
import com.stockmanagement.stock_management_api.master.identity.user.entity.AppUser;
import com.stockmanagement.stock_management_api.master.identity.user.repository.AppUserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private static final String ADMIN_EMAIL = "admin@stock.local";
    private static final String ADMIN_PASSWORD = "admin123";

    private final RoleRepository roles;
    private final PermissionRepository permissions;
    private final RolePermissionRepository rolePermissions;
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrap(
            RoleRepository roles,
            PermissionRepository permissions,
            RolePermissionRepository rolePermissions,
            AppUserRepository users,
            PasswordEncoder passwordEncoder) {
        this.roles = roles;
        this.permissions = permissions;
        this.rolePermissions = rolePermissions;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        System.out.println("[bootstrap] Initializing default admin user and permissions");
        Role adminRole = roles.findAll().stream()
                .filter(role -> "Administrator".equalsIgnoreCase(role.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("Administrator");
                    role.setDescription("System administrator");
                    role.setBuiltIn(true);
                    role.setIsActive(true);
                    return roles.save(role);
                });

        List<String> desiredPermissions = List.of(
                "ADMIN",
                "MASTER_DATA_READ",
                "MASTER_DATA_WRITE",
                "USER_MANAGE",
                "ROLE_MANAGE"
        );

        for (String permissionCode : desiredPermissions) {
            Permission permission = permissions.findAll().stream()
                    .filter(item -> permissionCode.equalsIgnoreCase(item.getCode()))
                    .findFirst()
                    .orElseGet(() -> {
                        Permission item = new Permission();
                        item.setCode(permissionCode);
                        item.setLabel(permissionCode.replace('_', ' '));
                        item.setGroupName("Security");
                        return permissions.save(item);
                    });

            UUID roleId = adminRole.getId();
            UUID permissionId = permission.getId();
            boolean alreadyMapped = rolePermissions.findAllByRoleId(roleId).stream()
                    .anyMatch(mapping -> mapping.getPermissionId().equals(permissionId));

            if (!alreadyMapped) {
                RolePermission mapping = new RolePermission();
                mapping.setRoleId(roleId);
                mapping.setPermissionId(permissionId);
                rolePermissions.save(mapping);
            }
        }

        AppUser adminUser = users.findByEmailIgnoreCase(ADMIN_EMAIL)
                .orElseGet(() -> {
                    AppUser user = new AppUser();
                    user.setName("Administrator");
                    user.setEmail(ADMIN_EMAIL);
                    user.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
                    user.setRoleId(adminRole.getId());
                    user.setDepartmentId(null);
                    user.setIsActive(true);
                    return users.save(user);
                });

        if (!adminUser.getRoleId().equals(adminRole.getId()) || !adminUser.getIsActive()) {
            adminUser.setRoleId(adminRole.getId());
            adminUser.setIsActive(true);
            users.save(adminUser);
        }

        if (!passwordEncoder.matches(ADMIN_PASSWORD, adminUser.getPasswordHash())) {
            adminUser.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
            users.save(adminUser);
        }
    }
}
