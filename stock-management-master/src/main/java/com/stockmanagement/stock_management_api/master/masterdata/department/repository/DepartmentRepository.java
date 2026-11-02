package com.stockmanagement.stock_management_api.master.masterdata.department.repository;

import com.stockmanagement.stock_management_api.master.masterdata.department.entity.Department;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    @Query("""
        SELECT d FROM Department d
        WHERE (:active IS NULL OR d.isActive = :active)
          AND (
            :search IS NULL OR :search = '' OR
            LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(d.code) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(d.location) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(d.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
          )
        ORDER BY d.name ASC
    """)
    List<Department> findFiltered(
            @Param("active") Boolean active,
            @Param("search") String search
    );
}
