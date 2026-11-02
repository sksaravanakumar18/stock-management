package com.stockmanagement.stock_management_api.master.masterdata.customer.service;

import com.stockmanagement.stock_management_api.master.masterdata.customer.dto.CustomerRequest;
import com.stockmanagement.stock_management_api.master.masterdata.customer.dto.CustomerResponse;
import com.stockmanagement.stock_management_api.master.masterdata.customer.entity.Customer;
import com.stockmanagement.stock_management_api.master.masterdata.customer.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
public class CustomerService {
    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> findAll(Boolean active, String search) {
        String normalizedSearch = (search == null) ? "" : search.trim();
        return repository.findFiltered(active, normalizedSearch)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        Customer entity = new Customer();
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public CustomerResponse update(UUID id, CustomerRequest request) {
        Customer entity = findEntity(id);
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        Customer entity = findEntity(id);
        entity.setIsActive(false);
        repository.save(entity);
    }

    private Customer findEntity(UUID id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found: " + id));
    }

    private void apply(Customer entity, CustomerRequest request) {
        entity.setName(request.name());
        
        // Auto-generate code if not provided or empty
        String code = request.code();
        if (code == null || code.trim().isEmpty()) {
            code = generateCodeFromName(request.name());
        }
        entity.setCode(code);
        
        entity.setType(request.type());
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

    private CustomerResponse toResponse(Customer entity) {
        return new CustomerResponse(entity.getId(), entity.getCode(), entity.getName(), entity.getType(), entity.getContactPerson(), entity.getPhone(), entity.getEmail(), entity.getTaxId(), entity.getAddress(), entity.getIsActive());
    }
}
