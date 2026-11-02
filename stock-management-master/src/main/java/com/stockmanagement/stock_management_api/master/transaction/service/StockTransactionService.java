package com.stockmanagement.stock_management_api.master.transaction.service;

import com.stockmanagement.stock_management_api.master.transaction.dto.StockTransactionRequest;
import com.stockmanagement.stock_management_api.master.transaction.dto.StockTransactionResponse;
import com.stockmanagement.stock_management_api.master.transaction.dto.TransactionLineItemResponse;
import com.stockmanagement.stock_management_api.master.transaction.entity.StockTransaction;
import com.stockmanagement.stock_management_api.master.transaction.entity.TransactionLineItem;
import com.stockmanagement.stock_management_api.master.transaction.repository.StockTransactionRepository;
import com.stockmanagement.stock_management_api.master.transaction.repository.TransactionLineItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class StockTransactionService {
    private final StockTransactionRepository repository;
    private final TransactionLineItemRepository lineItemRepository;
    private final StockLedgerService ledgerService;

    public StockTransactionService(
            StockTransactionRepository repository,
            TransactionLineItemRepository lineItemRepository,
            StockLedgerService ledgerService) {
        this.repository = repository;
        this.lineItemRepository = lineItemRepository;
        this.ledgerService = ledgerService;
    }

    @Transactional(readOnly = true)
    public List<StockTransactionResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StockTransactionResponse findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public StockTransactionResponse create(StockTransactionRequest request) {
        if (request.lineItems() == null || request.lineItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction must have at least one line item");
        }

        StockTransaction transaction = new StockTransaction();
        transaction.setReferenceNumber(request.referenceNumber());
        transaction.setTransactionType(request.transactionType());
        transaction.setVendorId(request.vendorId());
        transaction.setCustomerId(request.customerId());
        transaction.setNotes(request.notes());
        transaction.setTransactionDate(request.transactionDate() != null ?
                request.transactionDate() : LocalDateTime.now());
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());

        StockTransaction saved = repository.save(transaction);

        BigDecimal totalAmount = BigDecimal.ZERO;
        String movementType = getMovementType(request.transactionType());

        for (var lineItemRequest : request.lineItems()) {
            BigDecimal discount = lineItemRequest.discount() != null ? lineItemRequest.discount() : BigDecimal.ZERO;
            BigDecimal lineTotal = lineItemRequest.quantity()
                    .multiply(lineItemRequest.unitPrice())
                    .subtract(discount);

            TransactionLineItem lineItem = new TransactionLineItem();
            lineItem.setTransactionId(saved.getId());
            lineItem.setProductId(lineItemRequest.productId());
            lineItem.setQuantity(lineItemRequest.quantity());
            lineItem.setUnitPrice(lineItemRequest.unitPrice());
            lineItem.setDiscount(discount);
            lineItem.setLineTotal(lineTotal);

            lineItemRepository.save(lineItem);

            totalAmount = totalAmount.add(lineTotal);

            ledgerService.recordMovement(
                    lineItemRequest.productId(),
                    movementType,
                    lineItemRequest.quantity(),
                    saved.getId(),
                    "Transaction: " + request.transactionType()
            );
        }

        saved.setTotalAmount(totalAmount);
        repository.save(saved);

        return toResponse(saved);
    }

    @Transactional
    public StockTransactionResponse update(UUID id, StockTransactionRequest request) {
        StockTransaction transaction = findEntity(id);
        transaction.setNotes(request.notes());
        transaction.setUpdatedAt(LocalDateTime.now());
        return toResponse(repository.save(transaction));
    }

    @Transactional
    public void delete(UUID id) {
        StockTransaction transaction = findEntity(id);
        transaction.setIsActive(false);
        transaction.setUpdatedAt(LocalDateTime.now());
        repository.save(transaction);
    }

    private String getMovementType(String transactionType) {
        return switch (transactionType.toUpperCase()) {
            case "INWARD", "DISPATCH", "RETURN" -> "IN";
            case "OUTWARD", "CANCEL", "REJECT", "ORDERED" -> "OUT";
            default -> throw new IllegalArgumentException("Unknown transaction type: " + transactionType);
        };
    }

    private StockTransaction findEntity(UUID id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found: " + id));
    }

    private StockTransactionResponse toResponse(StockTransaction entity) {
        List<TransactionLineItemResponse> lineItems = lineItemRepository.findByTransactionId(entity.getId())
                .stream()
                .map(li -> new TransactionLineItemResponse(
                        li.getId(),
                        li.getProductId(),
                        li.getQuantity(),
                        li.getUnitPrice(),
                        li.getDiscount(),
                        li.getLineTotal()
                ))
                .toList();

        return new StockTransactionResponse(
                entity.getId(),
                entity.getReferenceNumber(),
                entity.getTransactionType(),
                entity.getVendorId(),
                entity.getCustomerId(),
                entity.getNotes(),
                entity.getTransactionDate(),
                entity.getTotalAmount(),
                entity.isActive(),
                entity.getCreatedAt(),
                lineItems
        );
    }
}
