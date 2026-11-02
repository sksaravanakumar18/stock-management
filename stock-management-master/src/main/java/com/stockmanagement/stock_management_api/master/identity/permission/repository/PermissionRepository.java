package com.stockmanagement.stock_management_api.master.identity.permission.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import com.stockmanagement.stock_management_api.master.identity.permission.entity.Permission;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {}
