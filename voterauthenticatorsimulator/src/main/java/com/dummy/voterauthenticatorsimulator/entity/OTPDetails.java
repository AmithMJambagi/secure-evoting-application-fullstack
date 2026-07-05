package com.dummy.voterauthenticatorsimulator.entity;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OTPDetails {
	 private String otp;

	    private LocalDateTime expiryTime;

	    private LocalDateTime nextResendTime;

	    private int attempts;
}
