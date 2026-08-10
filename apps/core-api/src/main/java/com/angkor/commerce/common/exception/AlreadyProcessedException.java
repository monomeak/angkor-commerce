package com.angkor.commerce.common.exception;

public class AlreadyProcessedException extends RuntimeException {

    public AlreadyProcessedException(String msg) {
        super(msg);
    }
}
