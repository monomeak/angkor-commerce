package com.angkor.commerce.common.dto;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public record OffsetPageable (
        int skip,int limit, Sort sort

) implements Pageable {
    @Override
    public int getPageNumber() {
        return skip/limit;
    }

    @Override
    public int getPageSize() {
        return limit;
    }

    @Override
    public long getOffset() {
        return skip;
    }

    @Override
    public Sort getSort() {
        return sort;
    }

    @Override
    public Pageable next() {
        return new OffsetPageable(skip+limit,limit,sort);
    }

    @Override
    public Pageable previousOrFirst() {
        return hasPrevious() ? new OffsetPageable(skip - limit, limit, sort) : first();

    }

    @Override
    public Pageable first() {
        return new OffsetPageable(0, limit, sort);

    }

    @Override
    public Pageable withPage(int pageNumber) {
        return new OffsetPageable(pageNumber * limit, limit, sort);
    }

    @Override
    public boolean hasPrevious() {
        return skip>0;
    }

    @Override
    public boolean isPaged(){
        return true;
    }
}
