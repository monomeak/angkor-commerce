package com.angkor.commerce.common.dto;

import java.util.List;
import org.springframework.data.domain.Page;

public record PageResponse<T>(List<T> items, long total, int skip, int limit) {
    public static <T> PageResponse<T> of(Page<T> page, int skip, int limit) {
        return new PageResponse<>(page.getContent(), page.getTotalElements(), skip, limit);
    }
}
