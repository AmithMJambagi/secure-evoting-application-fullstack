package com.dummy.voterauthenticatorsimulator.exception;

public class MaxOtpAttemptsExceededException extends RuntimeException {

    public MaxOtpAttemptsExceededException() {
        super("Maximum OTP verification attempts exceeded. Please request a new OTP.");
    }
}