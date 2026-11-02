package com.stockmanagement.stock_management_api.master.identity.rolepermission.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "role_permission")
public class RolePermission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private java.util.UUID roleId;

    @Column(nullable = false)
    private java.util.UUID permissionId;

    public RolePermission() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public java.util.UUID getRoleId() { return roleId; }
    public void setRoleId(java.util.UUID roleId) { this.roleId = roleId; }
    public java.util.UUID getPermissionId() { return permissionId; }
    public void setPermissionId(java.util.UUID permissionId) { this.permissionId = permissionId; }
}
