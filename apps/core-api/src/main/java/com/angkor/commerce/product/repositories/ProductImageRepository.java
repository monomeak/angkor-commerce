package com.angkor.commerce.product.repositories;

import com.angkor.commerce.product.entities.ProductImage;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderByDisplayOrderAscIdAsc(Long productId);

    Optional<ProductImage> findByIdAndProductId(Long id, Long productId);

    @Query("select coalesce(max(i.displayOrder), -1) from ProductImage i where i.product.id = :productId")
    int findMaxDisplayOrder(@Param("productId") Long productId);

    long countByProductId(Long productId);
}
