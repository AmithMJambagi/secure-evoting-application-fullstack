package com.dummy.voterauthenticatorsimulator.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dummy.voterauthenticatorsimulator.entity.OTPDetails;
import com.dummy.voterauthenticatorsimulator.entity.Voter;
import com.dummy.voterauthenticatorsimulator.exception.OtpSessionExpiredException;
import com.dummy.voterauthenticatorsimulator.exception.ResendOtpNotAllowedException;
import com.dummy.voterauthenticatorsimulator.exception.VoterDeceasedException;
import com.dummy.voterauthenticatorsimulator.exception.VoterNotEligibleException;
import com.dummy.voterauthenticatorsimulator.exception.VoterNotFoundException;
import com.dummy.voterauthenticatorsimulator.repository.VoterRepository;

@Service
public class OTPService {
	@Autowired
	PasswordEncoder passwordEncoder;
	@Autowired
	VoterRepository voterRepository;
	private final Map<Long, OTPDetails> otpStore =
	        new ConcurrentHashMap<>();
	private final SecureRandom random = new SecureRandom();
//	public String generateOTP(Long voterId) {
//		
//		
//		String plainOtp = String.valueOf(100000+random.nextInt(900000));
//		String otp=passwordEncoder.encode(plainOtp);
//		OTPDetails details = OTPDetails.builder()
//		        .otp(otp)
//		        .expiryTime(LocalDateTime.now().plusMinutes(5))
//		        .attempts(0)
//		        .build();
//		otpStore.put(voterId,details);
//		return plainOtp;
//	}
//	public String generateOTP(Long voterId) {
//
//	    OTPDetails existingOtp = otpStore.get(voterId);
//
//	    // Existing OTP still valid
//	    if (existingOtp != null) {
//
//	        // Session expired
//	        if (LocalDateTime.now().isAfter(existingOtp.getExpiryTime())) {
//	            otpStore.remove(voterId);
//	            throw new OtpSessionExpiredException();
//	        }
//
//	        // Too early to resend
//	        if (LocalDateTime.now().isBefore(existingOtp.getNextResendTime())) {
//	            throw new ResendOtpNotAllowedException();
//	        }
//	    }
//
//	    
//	    String plainOtp = String.valueOf(100000 + random.nextInt(900000));
//
//	    String encodedOtp = passwordEncoder.encode(plainOtp);
//
//	    // Preserve original expiry if this is a resend
//	    LocalDateTime expiry = (existingOtp == null)
//	            ? LocalDateTime.now().plusMinutes(5)
//	            : existingOtp.getExpiryTime();
//
//	    OTPDetails details = OTPDetails.builder()
//	            .otp(encodedOtp)
//	            .expiryTime(expiry)
//	            .nextResendTime(LocalDateTime.now().plusSeconds(150))
//	            .attempts(0)
//	            .build();
//
//	    otpStore.put(voterId, details);
//
//	    return plainOtp;
//	}
	
	
	public String generateOTP(Long voterId) {

	    // Validate voter exists
	    Voter voter = voterRepository.findById(voterId)
	            .orElseThrow(() -> new VoterNotFoundException(voterId));

	    // Validate voter status
	    if (voter.getDeathDate() != null) {
	        throw new VoterDeceasedException();
	    }

	    if (!voter.isEligibleToVote()) {
	        throw new VoterNotEligibleException();
	    }

	    LocalDateTime now = LocalDateTime.now();

	    OTPDetails existingOtp = otpStore.get(voterId);

	    if (existingOtp != null) {

	        // Authentication session expired
	        if (now.isAfter(existingOtp.getExpiryTime())) {
	            otpStore.remove(voterId);
	            throw new OtpSessionExpiredException();
	        }

	        // Resend requested too early
	        if (now.isBefore(existingOtp.getNextResendTime())) {

	            long secondsLeft = java.time.Duration
	                    .between(now, existingOtp.getNextResendTime())
	                    .getSeconds();

	            throw new ResendOtpNotAllowedException();
	        }
	    }

	    String plainOtp = String.valueOf(100000 + random.nextInt(900000));
	    String encodedOtp = passwordEncoder.encode(plainOtp);

	    LocalDateTime expiry = (existingOtp == null)
	            ? now.plusMinutes(5)
	            : existingOtp.getExpiryTime();

	    OTPDetails details = OTPDetails.builder()
	            .otp(encodedOtp)
	            .expiryTime(expiry)
	            .nextResendTime(now.plusSeconds(150))
	            .attempts(0)
	            .build();

	    otpStore.put(voterId, details);

	    return plainOtp;
	}
	public OTPStatus verifyOTP(Long voterId, String enteredOTP) {

	    OTPDetails otpDetails = otpStore.get(voterId);

	    if (otpDetails == null) {
	        return OTPStatus.NOT_FOUND;
	    }

	    if (LocalDateTime.now().isAfter(otpDetails.getExpiryTime())) {

	        otpStore.remove(voterId);

	        return OTPStatus.EXPIRED;
	    }

	    if (otpDetails.getAttempts() >= 3) {

	        otpStore.remove(voterId);

	        return OTPStatus.MAX_ATTEMPTS_EXCEEDED;
	    }

	    if (!passwordEncoder.matches(enteredOTP, otpDetails.getOtp())) {

	        otpDetails.setAttempts(
	                otpDetails.getAttempts() + 1);

	        return OTPStatus.INVALID;
	    }

	    otpStore.remove(voterId);

	    return OTPStatus.SUCCESS;
	}
	public void removeOTP(Long voterId) {

	    otpStore.remove(voterId);
	}
}
