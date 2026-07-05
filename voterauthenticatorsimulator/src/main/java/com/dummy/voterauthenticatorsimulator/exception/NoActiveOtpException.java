package com.dummy.voterauthenticatorsimulator.exception;

public class NoActiveOtpException extends RuntimeException {

    public NoActiveOtpException() {
        super("No active OTP found. Please request a new OTP.");
    }
}