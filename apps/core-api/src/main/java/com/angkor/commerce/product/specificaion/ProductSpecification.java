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
    /**
     * @param categoryIds the already-resolved category subtree, or null for "no category
     *                    filter". Resolution lives in ProductServiceImpl: this class is
     *                    static and has no repository to walk the category tree with.
     */
    public static Specification<Product> from(ProductQueryParams q, List<Long> categoryIds) {
        return Specification
                .where(status(q.status()))
                .and(categoryIn(categoryIds))
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

    /**
     * Matches the category subtree, not one category. Products hang off leaf categories
     * only, so an exact match on a parent ("men") returned an empty grid — the storefront's
     * top-level browse pages are all parents.
     */
    private static Specification<Product> categoryIn(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return Specification.unrestricted();
        if (ids.size() == 1) return (root, cq, cb) -> cb.equal(root.get("category").get("id"), ids.getFirst());
        return (root, cq, cb) -> root.get("category").get("id").in(ids);
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
