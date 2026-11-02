package com.stockmanagement.stock_management_api.master.identity.user.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "app_user")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false)
    private java.util.UUID roleId;

    @Column(nullable = true)
    private java.util.UUID departmentId;

    @Column(nullable = false)
    private boolean isActive;

    public AppUser() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public java.util.UUID getRoleId() { return roleId; }
    public void setRoleId(java.util.UUID roleId) { this.roleId = roleId; }
    public java.util.UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(java.util.UUID departmentId) { this.departmentId = departmentId; }
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
}
