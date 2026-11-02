package com.stockmanagement.stock_management_api.master.masterdata.department.controller;

import com.stockmanagement.stock_management_api.master.masterdata.department.dto.DepartmentRequest;
import com.stockmanagement.stock_management_api.master.masterdata.department.dto.DepartmentResponse;
import com.stockmanagement.stock_management_api.master.masterdata.department.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {
    private final DepartmentService service;

    public DepartmentController(DepartmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<DepartmentResponse> findAll(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String search) {
        Boolean active = switch (status.toUpperCase()) {
            case "ACTIVE" -> true;
            case "INACTIVE" -> false;
            default -> null;
        };
        return service.findAll(active, search);
    }

    @GetMapping("/{id}")
    public DepartmentResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<DepartmentResponse> create(@Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public DepartmentResponse update(@PathVariable UUID id, @Valid @RequestBody DepartmentRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
