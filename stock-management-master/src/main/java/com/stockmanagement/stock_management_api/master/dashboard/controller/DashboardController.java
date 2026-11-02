package com.stockmanagement.stock_management_api.master.dashboard.controller;

import com.stockmanagement.stock_management_api.master.dashboard.dto.DashboardSummary;
import com.stockmanagement.stock_management_api.master.dashboard.dto.InventoryMovement;
import com.stockmanagement.stock_management_api.master.dashboard.dto.RecentTransaction;
import com.stockmanagement.stock_management_api.master.dashboard.dto.StockLevel;
import com.stockmanagement.stock_management_api.master.dashboard.dto.TransactionAlert;
import com.stockmanagement.stock_management_api.master.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary() {
        return ResponseEntity.ok(service.getSummary());
    }

    @GetMapping("/levels")
    public ResponseEntity<List<StockLevel>> getStockLevels(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(service.getStockLevels(limit));
    }

    @GetMapping("/stock-levels")
    public ResponseEntity<List<StockLevel>> getStockLevelsAlias(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(service.getStockLevels(limit));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<RecentTransaction>> getRecentTransactions(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(service.getRecentTransactions(limit));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<TransactionAlert>> getAlerts() {
        return ResponseEntity.ok(service.getAlerts());
    }

    @GetMapping("/inventory-movement")
    public ResponseEntity<List<InventoryMovement>> getInventoryMovement(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(service.getInventoryMovement(days));
    }
}
