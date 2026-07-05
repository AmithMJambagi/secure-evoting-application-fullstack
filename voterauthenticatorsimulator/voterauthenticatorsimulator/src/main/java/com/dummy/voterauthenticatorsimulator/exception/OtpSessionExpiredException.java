package com.dummy.voterauthenticatorsimulator.exception;

public class OtpSessionExpiredException extends RuntimeException {

    public OtpSessionExpiredException() {
        super("OTP session expired. Please login again.");
    }
}
