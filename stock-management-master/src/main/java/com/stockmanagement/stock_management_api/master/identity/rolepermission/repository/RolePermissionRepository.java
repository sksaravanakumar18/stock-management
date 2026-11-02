package com.stockmanagement.stock_management_api.master.identity.rolepermission.repository;

import com.stockmanagement.stock_management_api.master.identity.rolepermission.entity.RolePermission;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, UUID> {
    List<RolePermission> findAllByRoleId(UUID roleId);
}