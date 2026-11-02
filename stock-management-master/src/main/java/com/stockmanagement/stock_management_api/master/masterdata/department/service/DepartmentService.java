package com.stockmanagement.stock_management_api.master.masterdata.department.service;

import com.stockmanagement.stock_management_api.master.masterdata.department.dto.DepartmentRequest;
import com.stockmanagement.stock_management_api.master.masterdata.department.dto.DepartmentResponse;
import com.stockmanagement.stock_management_api.master.masterdata.department.entity.Department;
import com.stockmanagement.stock_management_api.master.masterdata.department.repository.DepartmentRepository;
import com.stockmanagement.stock_management_api.master.masterdata.product.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
public class DepartmentService {
    private final DepartmentRepository repository;
    private final ProductRepository productRepository;

    public DepartmentService(DepartmentRepository repository, ProductRepository productRepository) {
        this.repository = repository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> findAll(Boolean active, String search) {
        String normalizedSearch = (search == null) ? "" : search.trim();
        return repository.findFiltered(active, normalizedSearch)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        Department entity = new Department();
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public DepartmentResponse update(UUID id, DepartmentRequest request) {
        Department entity = findEntity(id);
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        Department entity = findEntity(id);
        if (productRepository.countByDepartmentId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete department because it is assigned to one or more products.");
        }
        entity.setIsActive(false);
        repository.save(entity);
    }

    private Department findEntity(UUID id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found: " + id));
    }

    private void apply(Department entity, DepartmentRequest request) {
        entity.setName(request.name());
        
        // Auto-generate code if not provided or empty
        String code = request.code();
        if (code == null || code.trim().isEmpty()) {
            code = generateCodeFromName(request.name());
        }
        entity.setCode(code);
        
        entity.setLocation(request.location());
        entity.setDescription(request.description());
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

    private DepartmentResponse toResponse(Department entity) {
        return new DepartmentResponse(entity.getId(), entity.getName(), entity.getCode(), entity.getLocation(), entity.getDescription(), entity.getIsActive());
    }
}
