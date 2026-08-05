package com.angkor.commerce.product.repositories;

import com.angkor.commerce.product.dto.response.ProductAggregate;
import com.angkor.commerce.product.entities.ProductVariant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdOrderByIdAsc(Long productId);
    Optional<ProductVariant> findByIdAndProductId(Long id, Long productId);

    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);

    long countByProductId(Long productId);

    // Aggregates for list views — avoids loading variants per product
    @Query(
        """
        select v.product.id      as productId,
               coalesce(sum(v.stock), 0) as totalStock,
               count(v)          as variantCount,
               min(coalesce(v.priceOverride, v.product.price)) as minPrice
        from ProductVariant v
        where v.product.id in :productIds
        group by v.product.id
        """
    )
    List<ProductAggregate> aggragateByProductIds(@Param("productIds") Collection<Long> productIds);
}
