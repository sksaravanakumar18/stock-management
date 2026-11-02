package com.stockmanagement.stock_management_api.master.identity.role.service;

import com.stockmanagement.stock_management_api.master.identity.role.dto.RoleRequest;
import com.stockmanagement.stock_management_api.master.identity.role.dto.RoleResponse;
import com.stockmanagement.stock_management_api.master.identity.role.entity.Role;
import com.stockmanagement.stock_management_api.master.identity.role.repository.RoleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
public class RoleService {
    private final RoleRepository repository;

    public RoleService(RoleRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RoleResponse findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public RoleResponse create(RoleRequest request) {
        Role entity = new Role();
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public RoleResponse update(UUID id, RoleRequest request) {
        Role entity = findEntity(id);
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        Role entity = findEntity(id);
        entity.setIsActive(false); repository.save(entity);
    }

    private Role findEntity(UUID id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found: " + id));
    }

    private void apply(Role entity, RoleRequest request) {
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setBuiltIn(request.builtIn());
        entity.setIsActive(request.isActive());
    }

    private RoleResponse toResponse(Role entity) {
        return new RoleResponse(entity.getId(), entity.getName(), entity.getDescription(), entity.getBuiltIn(), entity.getIsActive());
    }
}
