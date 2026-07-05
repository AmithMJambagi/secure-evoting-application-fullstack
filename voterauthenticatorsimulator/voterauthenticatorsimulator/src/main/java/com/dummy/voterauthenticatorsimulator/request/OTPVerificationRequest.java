package com.dummy.voterauthenticatorsimulator.request;

import lombok.Data;

@Data
public class OTPVerificationRequest {

    private Long voterId;

    private String otp;

}