package com.stockmanagement.stock_management_api.master.transaction.repository;

import com.stockmanagement.stock_management_api.master.transaction.entity.TransactionLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TransactionLineItemRepository extends JpaRepository<TransactionLineItem, UUID> {
    List<TransactionLineItem> findByTransactionId(UUID transactionId);

    List<TransactionLineItem> findByProductId(UUID productId);
}
