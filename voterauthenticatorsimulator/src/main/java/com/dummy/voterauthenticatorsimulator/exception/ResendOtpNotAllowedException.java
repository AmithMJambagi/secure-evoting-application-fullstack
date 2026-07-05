package com.dummy.voterauthenticatorsimulator.exception;

public class ResendOtpNotAllowedException extends RuntimeException {

    public ResendOtpNotAllowedException() {
        super("OTP can only be resent after 150 seconds.");
    }
}
