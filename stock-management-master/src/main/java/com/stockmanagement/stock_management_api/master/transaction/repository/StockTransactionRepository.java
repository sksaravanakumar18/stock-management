package com.stockmanagement.stock_management_api.master.transaction.repository;

import com.stockmanagement.stock_management_api.master.transaction.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, UUID> {
    List<StockTransaction> findByTransactionType(String transactionType);

    List<StockTransaction> findByVendorId(UUID vendorId);

    List<StockTransaction> findByCustomerId(UUID customerId);

    @Query("""
        SELECT st FROM StockTransaction st
        WHERE (:type IS NULL OR st.transactionType = :type)
          AND (:vendorId IS NULL OR st.vendorId = :vendorId)
          AND (:customerId IS NULL OR st.customerId = :customerId)
          AND st.transactionDate >= :startDate
          AND st.transactionDate <= :endDate
        ORDER BY st.transactionDate DESC
    """)
    List<StockTransaction> findFiltered(
            @Param("type") String type,
            @Param("vendorId") UUID vendorId,
            @Param("customerId") UUID customerId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
