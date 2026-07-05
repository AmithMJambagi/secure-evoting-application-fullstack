package com.dummy.voterauthenticatorsimulator.request;

import lombok.Data;

@Data
public class OTPRequest {

    private Long voterId;

    private String password;

}