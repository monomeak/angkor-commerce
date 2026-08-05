package com.angkor.commerce.product.dto.request;

import java.math.BigDecimal;
import java.util.Set;

import com.angkor.commerce.common.dto.OffsetPageable;
import com.angkor.commerce.common.enums.RecordStatus;

import jakarta.validation.ValidationException;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

public record ProductQueryParams(
    @Min(0) Integer skip,
    @Min(1) @Max(100) Integer limit,
    String sortBy,
    String order,
    Long categoryId, // ← was String category
    String categorySlug, // friendlier alternative
    RecordStatus status,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    Boolean inStock, // → EXISTS (variant with stock > 0)
    String size, // → EXISTS (variant with this size)
    String q
) {

    private static final int DEFAULT_LIMIT = 30;
    private static final int MAX_LIMIT     = 100;
    private static final String DEFAULT_SORT = "id";

    /** Whitelist — anything else is rejected rather than passed to Hibernate. */
    private static final Set<String> SORTABLE = Set.of(
            "id", "name", "price", "rating", "createdAt", "updatedAt"
    );


    public int skipOrDefault() {
        return skip == null || skip < 0 ? 0 : skip;
    }

    public int limitOrDefault() {
        if (limit == null) return DEFAULT_LIMIT;
        return Math.clamp(limit, 1, MAX_LIMIT);
    }


    private Sort toSort() {
        String field = resolveSortField();
        Sort.Direction direction = "desc".equalsIgnoreCase(order)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Sort sort = Sort.by(direction, field);

        // Tie-breaker: without a stable secondary sort, rows with equal values
        // can appear on two pages or none at all.
        return DEFAULT_SORT.equals(field) ? sort : sort.and(Sort.by(Sort.Direction.ASC, DEFAULT_SORT));
    }

    private String resolveSortField() {
        if (!StringUtils.hasText(sortBy)) return DEFAULT_SORT;

        // API exposes "title", entity field is "name"
        String field = "name".equals(sortBy) ? "name" : sortBy;

        if (!SORTABLE.contains(field)) {
            throw new ValidationException(
                    "Invalid sortBy '%s'. Allowed: %s".formatted(sortBy, String.join(", ", SORTABLE)));
        }
        return field;
    }



    public Pageable toPageable() {
        return new OffsetPageable(skipOrDefault(), limitOrDefault(), toSort());
    }


    /** True when any filter is active — useful for skipping work or caching decisions. */
    public boolean hasFilters() {
        return categoryId != null || StringUtils.hasText(categorySlug) || status != null
                || minPrice != null || maxPrice != null
                || Boolean.TRUE.equals(inStock) || StringUtils.hasText(size)
                || StringUtils.hasText(q);
    }

}
