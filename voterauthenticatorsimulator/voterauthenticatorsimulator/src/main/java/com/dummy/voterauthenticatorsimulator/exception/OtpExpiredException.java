package com.dummy.voterauthenticatorsimulator.exception;

public class OtpExpiredException extends RuntimeException {

    public OtpExpiredException() {
        super("The OTP has expired. Please request a new OTP.");
    }
}