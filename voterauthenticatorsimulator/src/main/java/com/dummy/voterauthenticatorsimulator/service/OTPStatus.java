package com.dummy.voterauthenticatorsimulator.service;

public enum OTPStatus {
	SUCCESS,

    INVALID,

    EXPIRED,

    MAX_ATTEMPTS_EXCEEDED,
    
    NOT_FOUND
}
