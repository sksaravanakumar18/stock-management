package com.stockmanagement.stock_management_api.master.masterdata.customer.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "customer")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.stockmanagement.stock_management_api.master.common.enums.CustomerType type;

    @Column(nullable = true, length = 255)
    private String contactPerson;

    @Column(nullable = true, length = 255)
    private String phone;

    @Column(nullable = true, length = 255)
    private String email;

    @Column(nullable = true, length = 255)
    private String taxId;

    @Column(nullable = true, length = 255)
    private String address;

    @Column(nullable = false)
    private boolean isActive;

    public Customer() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public com.stockmanagement.stock_management_api.master.common.enums.CustomerType getType() { return type; }
    public void setType(com.stockmanagement.stock_management_api.master.common.enums.CustomerType type) { this.type = type; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
}
