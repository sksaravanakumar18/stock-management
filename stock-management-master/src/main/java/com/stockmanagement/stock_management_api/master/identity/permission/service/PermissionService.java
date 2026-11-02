package com.stockmanagement.stock_management_api.master.identity.permission.service;

import com.stockmanagement.stock_management_api.master.identity.permission.dto.PermissionRequest;
import com.stockmanagement.stock_management_api.master.identity.permission.dto.PermissionResponse;
import com.stockmanagement.stock_management_api.master.identity.permission.entity.Permission;
import com.stockmanagement.stock_management_api.master.identity.permission.repository.PermissionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
public class PermissionService {
    private final PermissionRepository repository;

    public PermissionService(PermissionRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PermissionResponse findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public PermissionResponse create(PermissionRequest request) {
        Permission entity = new Permission();
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public PermissionResponse update(UUID id, PermissionRequest request) {
        Permission entity = findEntity(id);
        apply(entity, request);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        Permission entity = findEntity(id);
        repository.delete(entity);
    }

    private Permission findEntity(UUID id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found: " + id));
    }

    private void apply(Permission entity, PermissionRequest request) {
        entity.setCode(request.code());
        entity.setLabel(request.label());
        entity.setGroupName(request.groupName());
    }

    private PermissionResponse toResponse(Permission entity) {
        return new PermissionResponse(entity.getId(), entity.getCode(), entity.getLabel(), entity.getGroupName());
    }
}
