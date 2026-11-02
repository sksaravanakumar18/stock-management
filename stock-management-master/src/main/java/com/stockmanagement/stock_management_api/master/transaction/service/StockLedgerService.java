package com.stockmanagement.stock_management_api.master.transaction.service;

import com.stockmanagement.stock_management_api.master.transaction.dto.StockLedgerResponse;
import com.stockmanagement.stock_management_api.master.transaction.entity.StockLedger;
import com.stockmanagement.stock_management_api.master.transaction.repository.StockLedgerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StockLedgerService {
    private final StockLedgerRepository repository;

    public StockLedgerService(StockLedgerRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public StockLedgerResponse recordMovement(UUID productId, String movementType, BigDecimal quantity,
                                             UUID transactionId, String remarks) {
        BigDecimal currentBalance = getCurrentStockLevel(productId);
        BigDecimal newBalance;

        if ("IN".equals(movementType)) {
            newBalance = currentBalance.add(quantity);
        } else if ("OUT".equals(movementType)) {
            newBalance = currentBalance.subtract(quantity);
        } else {
            throw new IllegalArgumentException("Invalid movement type: " + movementType);
        }

        StockLedger ledger = new StockLedger();
        ledger.setProductId(productId);
        ledger.setMovementType(movementType);
        ledger.setQuantity(quantity);
        ledger.setRunningBalance(newBalance);
        ledger.setTransactionId(transactionId);
        ledger.setMovementDate(LocalDateTime.now());
        ledger.setRemarks(remarks);

        return toResponse(repository.save(ledger));
    }

    @Transactional(readOnly = true)
    public BigDecimal getCurrentStockLevel(UUID productId) {
        Optional<StockLedger> latest = repository.findLatestByProductId(productId);
        return latest.map(StockLedger::getRunningBalance).orElse(BigDecimal.ZERO);
    }

    @Transactional(readOnly = true)
    public BigDecimal getAvailableQuantity(UUID productId) {
        BigDecimal balance = getCurrentStockLevel(productId);
        return balance.max(BigDecimal.ZERO);
    }

    @Transactional(readOnly = true)
    public List<StockLedgerResponse> getMovementHistory(UUID productId) {
        return repository.findMovementHistoryByProductId(productId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private StockLedgerResponse toResponse(StockLedger entity) {
        return new StockLedgerResponse(
                entity.getId(),
                entity.getProductId(),
                entity.getMovementType(),
                entity.getQuantity(),
                entity.getRunningBalance(),
                entity.getTransactionId(),
                entity.getMovementDate(),
                entity.getRemarks()
        );
    }
}
