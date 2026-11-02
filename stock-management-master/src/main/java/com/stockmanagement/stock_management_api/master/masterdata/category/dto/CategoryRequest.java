package com.stockmanagement.stock_management_api.master.masterdata.category.dto;

public record CategoryRequest(
    String name,
    String code,
    String description,
    boolean isActive
) {
    public CategoryRequest(String name, String description, boolean isActive) {
        this(name, null, description, isActive);
    }
}
