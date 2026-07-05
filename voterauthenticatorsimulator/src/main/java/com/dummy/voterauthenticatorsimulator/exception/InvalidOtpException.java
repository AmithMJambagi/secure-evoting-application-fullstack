package com.dummy.voterauthenticatorsimulator.exception;

public class InvalidOtpException extends RuntimeException {

    public InvalidOtpException() {
        super("The OTP entered is invalid.");
    }
}