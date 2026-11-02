package com.stockmanagement.stock_management_api.master.masterdata.product.service;

import com.stockmanagement.stock_management_api.master.masterdata.product.dto.ProductRequest;
import com.stockmanagement.stock_management_api.master.masterdata.product.dto.ProductResponse;
import com.stockmanagement.stock_management_api.master.masterdata.product.entity.Product;
import com.stockmanagement.stock_management_api.master.masterdata.product.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {
    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAll(Boolean active, String search) {
        String normalizedSearch = (search == null) ? "" : search.trim();
        return repository.findFiltered(active, normalizedSearch)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product entity = new Product();
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        Product entity = findEntity(id);
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        Product entity = findEntity(id);
        entity.setIsActive(false);
        repository.save(entity);
    }

    private Product findEntity(UUID id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + id));
    }

    private void apply(Product entity, ProductRequest request) {
        entity.setName(request.name());
        
        // Auto-generate SKU if not provided or empty
        String sku = request.sku();
        if (sku == null || sku.trim().isEmpty()) {
            sku = generateCodeFromName(request.name());
        }
        entity.setSku(sku);
        
        entity.setCategoryId(request.categoryId());
        entity.setDepartmentId(request.departmentId());
        entity.setUnit(request.unit());
        entity.setPurchasePrice(request.purchasePrice());
        entity.setSalesPrice(request.salesPrice());
        entity.setTaxType(request.taxType());
        entity.setTaxRate(request.taxRate());
        entity.setReorderLevel(request.reorderLevel());
        entity.setIsActive(request.isActive());
    }

    private String generateCodeFromName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "TEMP" + System.currentTimeMillis();
        }
        // Extract first 4 characters, convert to uppercase, remove non-alphanumeric
        String code = name.substring(0, Math.min(4, name.length()))
                .toUpperCase()
                .replaceAll("[^A-Z0-9]", "");
        
        // If empty after filtering, use generated code
        if (code.isEmpty()) {
            return "TEMP" + System.currentTimeMillis();
        }
        return code;
    }

    private ProductResponse toResponse(Product entity) {
        return new ProductResponse(entity.getId(), entity.getSku(), entity.getName(), entity.getCategoryId(), entity.getDepartmentId(), entity.getUnit(), entity.getPurchasePrice(), entity.getSalesPrice(), entity.getTaxType(), entity.getTaxRate(), entity.getReorderLevel(), entity.getIsActive());
    }
}
