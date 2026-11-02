package com.stockmanagement.stock_management_api.master.transaction.repository;

import com.stockmanagement.stock_management_api.master.transaction.entity.StockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StockLedgerRepository extends JpaRepository<StockLedger, UUID> {
    List<StockLedger> findByProductIdOrderByMovementDateDesc(UUID productId);

    @Query("""
        SELECT sl FROM StockLedger sl
        WHERE sl.productId = :productId
        ORDER BY sl.movementDate DESC
        LIMIT 1
    """)
    Optional<StockLedger> findLatestByProductId(@Param("productId") UUID productId);

    @Query("""
        SELECT sl FROM StockLedger sl
        WHERE sl.productId = :productId
        ORDER BY sl.movementDate DESC
    """)
    List<StockLedger> findMovementHistoryByProductId(@Param("productId") UUID productId);
}
