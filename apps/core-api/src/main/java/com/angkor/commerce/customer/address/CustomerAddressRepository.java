package com.angkor.commerce.customer.address;

import com.angkor.commerce.common.enums.RecordStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
    @Query(
        """
        select a from CustomerAddress a
        where a.customer.id = :customerId and a.status <> 'DELETED'
        order by a.isDefault desc, a.id desc
        """
    )
    List<CustomerAddress> findActiveByCustomerId(@Param("customerId") Long customerId);

    @Query(
        """
        select a from CustomerAddress a
        where a.id = :id and a.customer.id = :customerId and a.status <> 'DELETED'
        """
    )
    Optional<CustomerAddress> findActiveByIdAndCustomerId(@Param("id") Long id, @Param("customerId") Long customerId);

    @Modifying
    @Query(
        """
        update CustomerAddress a set a.isDefault = false
        where a.customer.id = :customerId and a.isDefault = true
        """
    )
    void clearDefaultFor(@Param("customerId") Long customerId);

    @Query(
        """
        select count(a) from CustomerAddress a
        where a.customer.id = :customerId and a.status <> 'DELETED'
        """
    )
    long countActiveByCustomerId(@Param("customerId") Long customerId);

    Optional<CustomerAddress> findFirstByCustomerIdAndStatusAndIdNotOrderByCreatedAtAsc(
        Long customerId,
        RecordStatus status,
        Long excludedAddressId
    );
}
