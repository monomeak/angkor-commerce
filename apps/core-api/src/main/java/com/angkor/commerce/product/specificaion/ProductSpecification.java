package com.angkor.commerce.product.specificaion;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.product.dto.request.ProductQueryParams;
import com.angkor.commerce.product.entities.Product;
import com.angkor.commerce.product.entities.ProductVariant;
import jakarta.persistence.criteria.*;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
@NoArgsConstructor()
public final class ProductSpecification {
    public static Specification<Product> from(ProductQueryParams q) {
        return Specification
                .where(status(q.status()))
                .and(category(q.categoryId(),q.categorySlug()))
                .and(priceBetween(q.minPrice(), q.maxPrice()))
                .and(search(q.q()))
                .and(hasSize(q.size()))
                .and(inStock(q.inStock()));

    }
    /**
     * Archived (DELETED) products stay out of the default listing, but asking for them
     * explicitly must return them — the back office needs an "archived" filter to undo a
     * soft delete. An unconditional notDeleted() would have made them unreachable at any
     * filter setting.
     */
    private static Specification<Product> status(RecordStatus status) {
        return status == null
                ? (root, cq, cb) -> cb.notEqual(root.get("status"), RecordStatus.DELETED)
                : (root, cq, cb) -> cb.equal(root.get("status"), status);
    }

    private static Specification<Product> category(Long id, String slug) {
        if (id != null) return (root, cq, cb) -> cb.equal(root.get("category").get("id"), id);
        if (slug != null) return (root, cq, cb) -> cb.equal(root.get("category").get("slug"), slug);
        return Specification.unrestricted();
    }

    private static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        return (root,cq, cb) ->{
            List<Predicate> predicates = new ArrayList<>();
            if(min !=null) predicates.add(cb.greaterThanOrEqualTo(root.get("price"), min));
            if(max !=null) predicates.add(cb.lessThanOrEqualTo(root.get("price"), max));
            return predicates.isEmpty() ? null : cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Specification<Product> search(String q) {
        if(!StringUtils.hasText(q)) return Specification.unrestricted();
        String pattern = "%"+q.toLowerCase().trim()+"%"; // normalized the query string
        return (root, cq, cb) -> cb.or(cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("description")), pattern),
                variantSkuLike(root, cq, cb,pattern)
                );
    }

    private static Predicate variantSkuLike(Root<Product> root, CriteriaQuery <?> cq, CriteriaBuilder cb, String pattern) {
        Subquery<Long> subquery = cq.subquery(Long.class);
        Root<ProductVariant> v = subquery.from(ProductVariant.class);
        subquery.select(v.get("id")).where(
                cb.equal(v.get("product"), root),
                cb.like(cb.lower(v.get("sku")), pattern)
        );
        return  cb.exists(subquery);

    }

    private static Specification<Product> inStock(Boolean inStock){
        if(inStock == null){
            return Specification.unrestricted();
        }

        return (root, cq, cb) -> {
            Subquery<Long> subquery = cq.subquery(Long.class);
            Root<ProductVariant> v = subquery.from(ProductVariant.class);
            subquery.select(v.get("id")).where(
                    cb.equal(v.get("product"), root),
                    cb.greaterThan(v.get("stock"),0 ));
            return inStock ? cb.exists(subquery) : cb.not(cb.exists(subquery));

        };
    }

    private  static  Specification<Product> hasSize(String size){
        if(!StringUtils.hasText(size)){
            return Specification.unrestricted();
        }

        return (root, cq, cb) -> {
            Subquery<Long> subquery = cq.subquery(Long.class);
            Root<ProductVariant> v = subquery.from(ProductVariant.class);
            subquery.select(v.get("id")).where(
                    cb.equal(v.get("product"), root),
                    cb.equal(cb.lower(v.get("size")), size.toLowerCase() ));
            return cb.exists(subquery);

        };

    }













}
