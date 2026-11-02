package com.stockmanagement.stock_management_api.master.masterdata.category.repository;

import com.stockmanagement.stock_management_api.master.masterdata.category.entity.Category;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    @Query("""
        SELECT c FROM Category c
        WHERE (:active IS NULL OR c.isActive = :active)
          AND (
            :search IS NULL OR :search = '' OR
            LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(c.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
          )
        ORDER BY c.name ASC
    """)
    List<Category> findFiltered(
            @Param("active") Boolean active,
            @Param("search") String search
    );
}
