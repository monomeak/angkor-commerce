package com.angkor.commerce.common.exception;

public class InsufficientBalanceException extends RuntimeException {

    public InsufficientBalanceException(String msg) {
        super(msg);
    }
}
