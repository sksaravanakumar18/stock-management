package com.stockmanagement.stock_management_api.master.identity.role.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import com.stockmanagement.stock_management_api.master.identity.role.entity.Role;

public interface RoleRepository extends JpaRepository<Role, UUID> {}
