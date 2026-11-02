package com.stockmanagement.stock_management_api.master.masterdata.supplier.service;

import com.stockmanagement.stock_management_api.master.masterdata.supplier.dto.SupplierRequest;
import com.stockmanagement.stock_management_api.master.masterdata.supplier.dto.SupplierResponse;
import com.stockmanagement.stock_management_api.master.masterdata.supplier.entity.Supplier;
import com.stockmanagement.stock_management_api.master.masterdata.supplier.repository.SupplierRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
public class SupplierService {
    private final SupplierRepository repository;

    public SupplierService(SupplierRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> findAll(Boolean active, String search) {
        String normalizedSearch = (search == null) ? "" : search.trim();
        return repository.findFiltered(active, normalizedSearch)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SupplierResponse findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public SupplierResponse create(SupplierRequest request) {
        Supplier entity = new Supplier();
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public SupplierResponse update(UUID id, SupplierRequest request) {
        Supplier entity = findEntity(id);
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        Supplier entity = findEntity(id);
        entity.setIsActive(false);
        repository.save(entity);
    }

    private Supplier findEntity(UUID id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: " + id));
    }

    private void apply(Supplier entity, SupplierRequest request) {
        entity.setName(request.name());
        
        // Auto-generate code if not provided or empty
        String code = request.code();
        if (code == null || code.trim().isEmpty()) {
            code = generateCodeFromName(request.name());
        }
        entity.setCode(code);
        
        entity.setContactPerson(request.contactPerson());
        entity.setPhone(request.phone());
        entity.setEmail(request.email());
        entity.setTaxId(request.taxId());
        entity.setAddress(request.address());
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

    private SupplierResponse toResponse(Supplier entity) {
        return new SupplierResponse(entity.getId(), entity.getCode(), entity.getName(), entity.getContactPerson(), entity.getPhone(), entity.getEmail(), entity.getTaxId(), entity.getAddress(), entity.getIsActive());
    }
}
