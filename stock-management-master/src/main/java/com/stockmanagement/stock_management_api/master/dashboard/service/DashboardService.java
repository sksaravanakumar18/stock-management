package com.stockmanagement.stock_management_api.master.dashboard.service;

import com.stockmanagement.stock_management_api.master.dashboard.dto.DashboardSummary;
import com.stockmanagement.stock_management_api.master.dashboard.dto.InventoryMovement;
import com.stockmanagement.stock_management_api.master.dashboard.dto.RecentTransaction;
import com.stockmanagement.stock_management_api.master.dashboard.dto.StockLevel;
import com.stockmanagement.stock_management_api.master.dashboard.dto.TransactionAlert;
import com.stockmanagement.stock_management_api.master.masterdata.product.entity.Product;
import com.stockmanagement.stock_management_api.master.masterdata.product.repository.ProductRepository;
import com.stockmanagement.stock_management_api.master.transaction.entity.StockTransaction;
import com.stockmanagement.stock_management_api.master.transaction.repository.StockTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {
    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;

    public DashboardService(ProductRepository productRepository, StockTransactionRepository transactionRepository) {
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummary getSummary() {
        long totalProducts = productRepository.count();
        BigDecimal totalStockValue = productRepository.findAll().stream()
                .map(product -> product.getSalesPrice() == null ? BigDecimal.ZERO : product.getSalesPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long activeTransactions = transactionRepository.count();
        long usersOnline = 1;

        return new DashboardSummary(totalProducts, totalStockValue, activeTransactions, usersOnline);
    }

    @Transactional(readOnly = true)
    public List<StockLevel> getStockLevels(int limit) {
        List<StockLevel> levels = new ArrayList<>();
        productRepository.findAll().stream()
                .sorted(Comparator.comparing(Product::getName))
                .limit(limit > 0 ? limit : Integer.MAX_VALUE)
                .forEach(product -> {
                    BigDecimal currentStock = BigDecimal.ZERO;
                    String status = currentStock.compareTo(product.getReorderLevel()) < 0 ? "LOW" : "NORMAL";
                    if (currentStock.compareTo(BigDecimal.ZERO) == 0) {
                        status = "OUT_OF_STOCK";
                    }

                    levels.add(new StockLevel(
                            product.getId(),
                            product.getName(),
                            currentStock,
                            product.getReorderLevel(),
                            status
                    ));
                });
        return levels;
    }

    @Transactional(readOnly = true)
    public List<RecentTransaction> getRecentTransactions(int limit) {
        return transactionRepository.findAll().stream()
                .sorted((a, b) -> b.getTransactionDate().compareTo(a.getTransactionDate()))
                .limit(limit > 0 ? limit : 10)
                .map(t -> new RecentTransaction(
                        t.getId(),
                        t.getReferenceNumber(),
                        t.getTransactionType(),
                        t.getTotalAmount(),
                        t.getTransactionDate()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionAlert> getAlerts() {
        List<TransactionAlert> alerts = new ArrayList<>();
        long lowStockCount = productRepository.findAll().stream()
                .filter(p -> p.getReorderLevel() != null && p.getReorderLevel().compareTo(BigDecimal.ZERO) > 0)
                .count();

        if (lowStockCount > 0) {
            alerts.add(new TransactionAlert(
                    UUID.randomUUID(),
                    "LOW_STOCK",
                    "There are " + lowStockCount + " items with low stock levels",
                    LocalDateTime.now(),
                    "WARNING"
            ));
        }

        return alerts;
    }

    @Transactional(readOnly = true)
    public List<InventoryMovement> getInventoryMovement(int days) {
        List<InventoryMovement> movement = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = days; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            movement.add(new InventoryMovement(
                    date,
                    0,
                    0,
                    0
            ));
        }

        return movement;
    }
}
