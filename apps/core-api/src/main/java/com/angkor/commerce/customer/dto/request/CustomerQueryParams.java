package com.angkor.commerce.customer.dto.request;

import com.angkor.commerce.common.dto.OffsetPageable;
import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.common.exception.ValidationException;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

/**
 * Mirrors {@link com.angkor.commerce.product.dto.request.ProductQueryParams}. The search
 * parameter keeps its original name — {@code search}, not {@code q} — because the back office
 * already calls this endpoint with it.
 */
public record CustomerQueryParams(
    @Min(0) Integer skip,
    @Min(1) @Max(100) Integer limit,
    String sortBy,
    String order,
    RecordStatus status,
    String search
) {
    private static final int DEFAULT_LIMIT = 30;
    private static final int MAX_LIMIT = 100;
    private static final String DEFAULT_SORT = "id";

    /** Whitelist — anything else is rejected rather than passed to Hibernate. */
    private static final Set<String> SORTABLE = Set.of(
        "id",
        "firstName",
        "lastName",
        "companyName",
        "email",
        "createdAt",
        "updatedAt"
    );

    public int skipOrDefault() {
        return skip == null || skip < 0 ? 0 : skip;
    }

    public int limitOrDefault() {
        return limit == null ? DEFAULT_LIMIT : Math.clamp(limit, 1, MAX_LIMIT);
    }

    private String resolveSortField() {
        if (!StringUtils.hasText(sortBy)) {
            return DEFAULT_SORT;
        }

        if (!SORTABLE.contains(sortBy)) {
            String allowed = String.join(", ", SORTABLE);
            throw new ValidationException(
                "Invalid sortBy '%s'. Allowed: %s".formatted(sortBy, allowed),
                Map.of("sortBy", "Must be one of: " + allowed)
            );
        }
        return sortBy;
    }

    private Sort toSort() {
        String field = resolveSortField();
        Sort.Direction direction = "desc".equalsIgnoreCase(order) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, field);

        // Tie-breaker: without a stable secondary sort, rows with equal values
        // can appear on two pages or none at all.
        return DEFAULT_SORT.equals(field) ? sort : sort.and(Sort.by(Sort.Direction.ASC, DEFAULT_SORT));
    }

    public Pageable toPageable() {
        return new OffsetPageable(skipOrDefault(), limitOrDefault(), toSort());
    }
}
