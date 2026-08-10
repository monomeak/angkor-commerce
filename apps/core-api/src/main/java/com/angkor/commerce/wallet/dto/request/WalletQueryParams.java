package com.angkor.commerce.wallet.dto.request;

import com.angkor.commerce.common.dto.OffsetPageable;
import com.angkor.commerce.wallet.WalletTxnType;
import java.time.LocalDate;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public record WalletQueryParams(
    Integer limit,
    Integer skip,
    String sortBy,
    String order,
    WalletTxnType type,
    LocalDate startDate,
    LocalDate endDate,
    Long orderId
) {
    private static final int DEFAULT_LIMIT = 30;
    private static final String DEFAULT_SORT = "createdAt";

    /** Entity property names — {@code type} is accepted as an alias for the {@code txnType} column. */
    private static final Set<String> SORTABLE = Set.of(DEFAULT_SORT, "amount", "txnType");

    public WalletQueryParams {
        limit = limit == null ? DEFAULT_LIMIT : Math.clamp(limit, 1, 100);
        skip = skip == null || skip < 0 ? 0 : skip;
        sortBy = normaliseSort(sortBy);
        order = "asc".equalsIgnoreCase(order) ? "asc" : "desc";
    }

    /** {@code Set.of(...).contains(null)} throws, so an absent sortBy is filtered out first. */
    private static String normaliseSort(String sortBy) {
        String field = "type".equals(sortBy) ? "txnType" : sortBy;
        return field != null && SORTABLE.contains(field) ? field : DEFAULT_SORT;
    }

    public Sort toSort() {
        // id tie-breaker keeps pagination stable when two rows share a timestamp
        return Sort.by(Sort.Direction.fromString(order), sortBy).and(Sort.by(Sort.Direction.DESC, "id"));
    }

    public Pageable toPageable() {
        return new OffsetPageable(skip, limit, toSort());
    }
}
