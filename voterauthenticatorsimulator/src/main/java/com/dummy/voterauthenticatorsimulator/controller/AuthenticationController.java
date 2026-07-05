package com.dummy.voterauthenticatorsimulator.controller;

import com.dummy.voterauthenticatorsimulator.entity.JwtResponse;
import com.dummy.voterauthenticatorsimulator.entity.MessageResponse;
import com.dummy.voterauthenticatorsimulator.request.OTPRequest;
import com.dummy.voterauthenticatorsimulator.request.OTPVerificationRequest;
import com.dummy.voterauthenticatorsimulator.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/request-otp")
    public ResponseEntity<MessageResponse> verifyVoter(
            @RequestBody OTPRequest request) {

        authenticationService.requestOTP(request.getVoterId(),request.getPassword());

        return ResponseEntity.ok(
                new MessageResponse("OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<JwtResponse> verifyOTP(
            @RequestBody OTPVerificationRequest request) {

        JwtResponse response = authenticationService.verifyOTP(
                request.getVoterId(),
                request.getOtp());

        return ResponseEntity.ok(response);
    }
}