package com.dummy.voterauthenticatorsimulator.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dummy.voterauthenticatorsimulator.entity.JwtResponse;
import com.dummy.voterauthenticatorsimulator.entity.Voter;
import com.dummy.voterauthenticatorsimulator.exception.InvalidOtpException;
import com.dummy.voterauthenticatorsimulator.exception.InvalidPasswordException;
import com.dummy.voterauthenticatorsimulator.exception.MaxOtpAttemptsExceededException;
import com.dummy.voterauthenticatorsimulator.exception.NoActiveOtpException;
import com.dummy.voterauthenticatorsimulator.exception.OtpExpiredException;
import com.dummy.voterauthenticatorsimulator.exception.VoterDeceasedException;
import com.dummy.voterauthenticatorsimulator.exception.VoterNotEligibleException;
import com.dummy.voterauthenticatorsimulator.exception.VoterNotFoundException;
import com.dummy.voterauthenticatorsimulator.repository.VoterRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final PasswordEncoder passwordEncoder;
    private final VoterRepository voterRepository;
    private final EmailService emailService;
    private final OTPService otpService;
    private final JwtService jwtService;

    /**
     * Validates the voter and sends an OTP to the registered email.
     */
    public void requestOTP(Long voterId, String password) {

        Voter voter = findVoter(voterId);

        validatePassword(password, voter);

        validateVoterStatus(voter);

        String otp = otpService.generateOTP(voterId);

        emailService.sendOTP(voter.getEmail(), otp);
    }

    /**
     * Verifies the OTP and returns a signed JWT.
     */
    public JwtResponse verifyOTP(Long voterId, String otp) {

        validateOtpStatus(otpService.verifyOTP(voterId, otp));

        Voter voter = findVoter(voterId);

        String token = jwtService.generateToken(voter);

        return JwtResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(1800)
                .build();
    }

    /**
     * Fetches a voter or throws an exception.
     */
    private Voter findVoter(Long voterId) {

        return voterRepository.findById(voterId)
                .orElseThrow(() -> new VoterNotFoundException(voterId));
    }

    /**
     * Validates the voter's password.
     */
    private void validatePassword(String password, Voter voter) {

        if (!passwordEncoder.matches(password, voter.getPassword())) {
            throw new InvalidPasswordException();
        }
    }

    /**
     * Checks if the voter is eligible to vote.
     */
    private void validateVoterStatus(Voter voter) {

        if (voter.getDeathDate() != null) {
        	System.out.println(new VoterDeceasedException());
            throw new VoterDeceasedException();
        }

        if (!voter.isEligibleToVote()) {
            throw new VoterNotEligibleException();
        }
    }

    /**
     * Validates the OTP verification status.
     */
    private void validateOtpStatus(OTPStatus status) {

        switch (status) {

            case SUCCESS:
                return;

            case INVALID:
                throw new InvalidOtpException();

            case EXPIRED:
                throw new OtpExpiredException();

            case MAX_ATTEMPTS_EXCEEDED:
                throw new MaxOtpAttemptsExceededException();

            case NOT_FOUND:
                throw new NoActiveOtpException();

            default:
                throw new IllegalStateException(
                        "Unexpected OTP verification status: " + status);
        }
    }
}