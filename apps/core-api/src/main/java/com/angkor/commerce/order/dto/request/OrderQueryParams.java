package com.angkor.commerce.order.dto.request;

import com.angkor.commerce.common.dto.OffsetPageable;
import com.angkor.commerce.common.exception.ValidationException;
import com.angkor.commerce.order.OrderStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

public record OrderQueryParams(
    @Min(0) Integer skip,
    @Min(1) @Max(100) Integer limit,
    OrderStatus status,
    String sortBy,
    String order
) {
    private static final int DEFAULT_LIMIT = 20;
    private static final String DEFAULT_SORT = "placedAt";
    private static final Set<String> SORTABLE = Set.of("id", "placedAt", "createdAt", "total", "orderNumber");

    public int skipOrDefault() {
        return skip == null || skip < 0 ? 0 : skip;
    }

    public int limitOrDefault() {
        return limit == null ? DEFAULT_LIMIT : Math.clamp(limit, 1, 100);
    }

    public Pageable toPageable() {
        String field = StringUtils.hasText(sortBy) ? sortBy : DEFAULT_SORT;
        if (!SORTABLE.contains(field)) {
            throw new ValidationException(
                "Invalid sortBy '%s'. Allowed: %s".formatted(sortBy, String.join(", ", SORTABLE))
            );
        }

        Sort.Direction dir = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;

        // id tie-breaker keeps pagination stable when values are equal
        Sort sort = Sort.by(dir, field).and(Sort.by(Sort.Direction.DESC, "id"));
        return new OffsetPageable(skipOrDefault(), limitOrDefault(), sort);
    }
}
