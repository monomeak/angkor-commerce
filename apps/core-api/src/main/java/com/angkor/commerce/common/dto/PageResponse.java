package com.angkor.commerce.common.dto;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;

public record PageResponse<T>(@JsonIgnore List<T> items, @JsonIgnore String key, long total, int skip, int limit) {
    @JsonAnyGetter
    public Map<String, Object> collection() {
        return Map.of(key, items);
    }

    public static <T> PageResponse<T> of(String key, List<T> items, long total, int skip, int limit) {
        return new PageResponse<>(items, key, total, skip, limit);
    }

    public static <T> PageResponse<T> empty(String key, int skip, int limit) {
        return new PageResponse<>(List.of(), key, 0, skip, limit);
    }
}
