package com.secure.evoting.service;

public class OTPServiceResponse {
    private final boolean success;
    private final int statusCode;
    private final String message;

    public OTPServiceResponse(boolean success, int statusCode, String message) {
        this.success = success;
        this.statusCode = statusCode;
        this.message = message;
    }

    public boolean isSuccess() { return success; }
    public int getStatusCode() { return statusCode; }
    public String getMessage() { return message; }
}
