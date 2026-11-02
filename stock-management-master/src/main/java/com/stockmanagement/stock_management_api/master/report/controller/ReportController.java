package com.stockmanagement.stock_management_api.master.report.controller;

import com.stockmanagement.stock_management_api.master.report.dto.StockMovementReport;
import com.stockmanagement.stock_management_api.master.report.dto.StockSummaryReport;
import com.stockmanagement.stock_management_api.master.report.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @GetMapping("/stock-summary")
    public ResponseEntity<StockSummaryReport> getStockSummary() {
        return ResponseEntity.ok(service.getStockSummary());
    }

    @GetMapping("/stock-movement")
    public ResponseEntity<List<StockMovementReport>> getStockMovementReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {

        LocalDateTime start = fromDate != null ? fromDate : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = toDate != null ? toDate : LocalDateTime.now();
        return ResponseEntity.ok(service.getMovementReport(start, end));
    }

    @GetMapping("/movement")
    public ResponseEntity<List<StockMovementReport>> getMovementReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        return getStockMovementReport(fromDate, toDate);
    }

    @GetMapping("/purchase")
    public ResponseEntity<List<Map<String, Object>>> getPurchaseReport() {
        return ResponseEntity.ok(service.getPurchaseReport());
    }

    @GetMapping("/purchases")
    public ResponseEntity<List<Map<String, Object>>> getPurchasesReport() {
        return getPurchaseReport();
    }

    @GetMapping("/dispatch")
    public ResponseEntity<List<Map<String, Object>>> getDispatchReport() {
        return ResponseEntity.ok(service.getDispatchReport());
    }

    @GetMapping("/exception")
    public ResponseEntity<List<Map<String, Object>>> getExceptionReport() {
        return ResponseEntity.ok(service.getExceptionReport());
    }

    @GetMapping("/exceptions")
    public ResponseEntity<List<Map<String, Object>>> getExceptionsReport() {
        return getExceptionReport();
    }

    @GetMapping("/tax")
    public ResponseEntity<List<Map<String, Object>>> getTaxReport() {
        return ResponseEntity.ok(service.getTaxReport());
    }

    @GetMapping("/custom")
    public ResponseEntity<List<Map<String, Object>>> getCustomReport() {
        return ResponseEntity.ok(service.getCustomReport());
    }

    @GetMapping("/{type}/export")
    public ResponseEntity<String> exportReport(
            @PathVariable String type,
            @RequestParam(defaultValue = "csv") String format) {
        String csv = service.exportCsv(type, format);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", type + "." + format);
        return new ResponseEntity<>(csv, headers, HttpStatus.OK);
    }

    @GetMapping("/export-csv")
    public ResponseEntity<String> exportCsv() {
        String csv = service.exportCsv("movement", "csv");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "stock-movements.csv");
        return new ResponseEntity<>(csv, headers, HttpStatus.OK);
    }
}
