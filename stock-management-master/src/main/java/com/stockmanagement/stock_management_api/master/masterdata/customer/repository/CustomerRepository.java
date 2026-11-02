package com.stockmanagement.stock_management_api.master.masterdata.customer.repository;

import com.stockmanagement.stock_management_api.master.masterdata.customer.entity.Customer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    @Query("""
        SELECT c FROM Customer c
        WHERE (:active IS NULL OR c.isActive = :active)
          AND (
            :search IS NULL OR :search = '' OR
            LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(c.contactPerson, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(c.phone, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(c.taxId, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(c.address, '')) LIKE LOWER(CONCAT('%', :search, '%'))
          )
        ORDER BY c.name ASC
    """)
    List<Customer> findFiltered(
            @Param("active") Boolean active,
            @Param("search") String search
    );
}
