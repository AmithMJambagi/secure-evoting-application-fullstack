package com.secure.evoting.service;

import com.secure.evoting.dto.JwtResponse;

public interface AuthenticationService {
    void requestOTP(String voterId, String password);
    JwtResponse verifyOTP(String voterId, String otp);
}