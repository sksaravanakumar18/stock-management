package com.stockmanagement.stock_management_api.master.identity.permission.controller;

import com.stockmanagement.stock_management_api.master.identity.permission.dto.PermissionRequest;
import com.stockmanagement.stock_management_api.master.identity.permission.dto.PermissionResponse;
import com.stockmanagement.stock_management_api.master.identity.permission.service.PermissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/permissions")
public class PermissionController {
    private final PermissionService service;

    public PermissionController(PermissionService service) {
        this.service = service;
    }

    @GetMapping
    public List<PermissionResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public PermissionResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<PermissionResponse> create(@Valid @RequestBody PermissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public PermissionResponse update(@PathVariable UUID id, @Valid @RequestBody PermissionRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
