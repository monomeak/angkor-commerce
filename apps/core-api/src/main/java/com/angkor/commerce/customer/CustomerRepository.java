package com.angkor.commerce.customer;

import com.angkor.commerce.common.enums.RecordStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {
    /** Dashboard KPI: registered customers, archived ones excluded. */
    long countByStatus(RecordStatus status);

    Optional<Customer> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
