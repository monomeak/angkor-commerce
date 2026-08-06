package com.angkor.commerce.common.exception;

import jakarta.persistence.criteria.CriteriaBuilder.In;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String msg) {
        super(msg);
    }
}
