package com.stockmanagement.stock_management_api.master.masterdata.product.repository;

import com.stockmanagement.stock_management_api.master.masterdata.product.entity.Product;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    @Query("""
        SELECT p FROM Product p
        WHERE (:active IS NULL OR p.isActive = :active)
          AND (
            :search IS NULL OR :search = '' OR
            LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(p.unit, '')) LIKE LOWER(CONCAT('%', :search, '%'))
          )
        ORDER BY p.name ASC
    """)
    List<Product> findFiltered(
            @Param("active") Boolean active,
            @Param("search") String search
    );

    long countByCategoryId(UUID categoryId);
    long countByDepartmentId(UUID departmentId);
}
