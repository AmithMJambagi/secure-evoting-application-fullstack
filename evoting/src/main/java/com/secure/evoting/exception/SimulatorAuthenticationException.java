package com.secure.evoting.exception;

import org.springframework.http.HttpStatusCode;

public class SimulatorAuthenticationException extends RuntimeException {
    
    private final HttpStatusCode statusCode;

    public SimulatorAuthenticationException(HttpStatusCode statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}