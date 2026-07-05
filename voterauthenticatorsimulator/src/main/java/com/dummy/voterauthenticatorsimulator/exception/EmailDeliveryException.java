package com.dummy.voterauthenticatorsimulator.exception;

public class EmailDeliveryException extends RuntimeException {

    public EmailDeliveryException() {
        super("Failed to send OTP email. Please try again later.");
    }

    public EmailDeliveryException(Throwable cause) {
        super("Failed to send OTP email. Please try again later. If the error persists contact nearest ECI office ", cause);
    }
}