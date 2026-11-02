package com.stockmanagement.stock_management_api.stock.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import com.stockmanagement.stock_management_api.stock.inventory.entity.StockLedgerEntry;

public interface StockLedgerEntryRepository extends JpaRepository<StockLedgerEntry, UUID> {}
