package com.angkor.commerce.product.repositories;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.product.entities.Product;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @Query("select p from Product p where p.id = :id and p.status <> 'DELETED'")
    Optional<Product> findActiveById(@Param("id") Long id);

    @Override
    @EntityGraph(attributePaths = {"category"})
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);


    @EntityGraph(attributePaths = {"category"})
    @Query("select p from Product p where p.id = :id and p.status <> 'DELETED'")
    Optional<Product> findActiveWithCategoryId(@Param("id") Long id);

    @EntityGraph(attributePaths = { "category" })
    Optional<Product> findByCategoryId(Long id);

    boolean existsByIdAndStatusNot(Long id, RecordStatus status);
}
