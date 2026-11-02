package com.stockmanagement.stock_management_api.master.transaction.controller;

import com.stockmanagement.stock_management_api.master.transaction.dto.StockTransactionRequest;
import com.stockmanagement.stock_management_api.master.transaction.dto.StockTransactionResponse;
import com.stockmanagement.stock_management_api.master.transaction.service.StockTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stock-transactions")
public class TransactionController {
    private final StockTransactionService service;

    public TransactionController(StockTransactionService service) {
        this.service = service;
    }

    @GetMapping
    public List<StockTransactionResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public StockTransactionResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<StockTransactionResponse> create(@Valid @RequestBody StockTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public StockTransactionResponse update(@PathVariable UUID id, @Valid @RequestBody StockTransactionRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
