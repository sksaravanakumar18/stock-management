package com.stockmanagement.stock_management_api.master.masterdata.supplier.repository;

import com.stockmanagement.stock_management_api.master.masterdata.supplier.entity.Supplier;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    @Query("""
        SELECT s FROM Supplier s
        WHERE (:active IS NULL OR s.isActive = :active)
          AND (
            :search IS NULL OR :search = '' OR
            LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(s.contactPerson, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(s.phone, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(s.email, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(s.taxId, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(s.address, '')) LIKE LOWER(CONCAT('%', :search, '%'))
          )
        ORDER BY s.name ASC
    """)
    List<Supplier> findFiltered(
            @Param("active") Boolean active,
            @Param("search") String search
    );
}
