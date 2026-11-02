package com.stockmanagement.stock_management_api.stock.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import com.stockmanagement.stock_management_api.stock.transaction.entity.StockTransaction;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, UUID> {}
