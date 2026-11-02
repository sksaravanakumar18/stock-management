package com.stockmanagement.stock_management_api.master.report.service;

import com.stockmanagement.stock_management_api.master.masterdata.product.repository.ProductRepository;
import com.stockmanagement.stock_management_api.master.report.dto.StockMovementReport;
import com.stockmanagement.stock_management_api.master.report.dto.StockSummaryReport;
import com.stockmanagement.stock_management_api.master.transaction.repository.StockLedgerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {
    private final ProductRepository productRepository;
    private final StockLedgerRepository ledgerRepository;

    public ReportService(ProductRepository productRepository, StockLedgerRepository ledgerRepository) {
        this.productRepository = productRepository;
        this.ledgerRepository = ledgerRepository;
    }

    @Transactional(readOnly = true)
    public StockSummaryReport getStockSummary() {
        long totalProducts = productRepository.count();
        long totalCategories = 0;
        BigDecimal totalStockValue = productRepository.findAll().stream()
                .map(product -> product.getSalesPrice() == null ? BigDecimal.ZERO : product.getSalesPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long lowStockItems = 0;
        long outOfStockItems = 0;

        return new StockSummaryReport(
                totalProducts,
                totalCategories,
                totalStockValue,
                lowStockItems,
                outOfStockItems
        );
    }

    @Transactional(readOnly = true)
    public List<StockMovementReport> getMovementReport(LocalDateTime startDate, LocalDateTime endDate) {
        return ledgerRepository.findAll().stream()
                .filter(sl -> sl.getMovementDate().isAfter(startDate) && sl.getMovementDate().isBefore(endDate))
                .map(sl -> new StockMovementReport(
                        sl.getProductId(),
                        "Product-" + sl.getProductId(),
                        sl.getMovementType(),
                        sl.getQuantity(),
                        sl.getRunningBalance(),
                        sl.getMovementDate(),
                        sl.getRemarks()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPurchaseReport() {
        List<Map<String, Object>> rows = new ArrayList<>();
        productRepository.findAll().forEach(product -> {
            Map<String, Object> row = new HashMap<>();
            row.put("productId", product.getId());
            row.put("productName", product.getName());
            row.put("quantity", 0);
            row.put("amount", 0);
            rows.add(row);
        });
        return rows;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDispatchReport() {
        return getPurchaseReport();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExceptionReport() {
        return getPurchaseReport();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTaxReport() {
        return getPurchaseReport();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCustomReport() {
        return getPurchaseReport();
    }

    @Transactional(readOnly = true)
    public String exportCsv(String type, String format) {
        if ("csv".equalsIgnoreCase(format)) {
            StringBuilder csv = new StringBuilder();
            csv.append("Type,Product,Quantity,Amount,Date\n");
            productRepository.findAll().forEach(product ->
                    csv.append(type).append(",")
                            .append(product.getName()).append(",")
                            .append(0).append(",")
                            .append(0).append(",")
                            .append(LocalDateTime.now()).append("\n")
            );
            return csv.toString();
        }
        return "Export format " + format + " is not available yet.";
    }

    @Transactional(readOnly = true)
    public String exportCsv() {
        return exportCsv("movement", "csv");
    }
}
