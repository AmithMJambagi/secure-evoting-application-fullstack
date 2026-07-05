package com.secure.evoting.dto;



import jakarta.validation.constraints.NotBlank;

public class OTPVerificationRequest {
    @NotBlank(message = "Voter ID cannot be blank")
    private String voterId;
    
    @NotBlank(message = "OTP code cannot be blank")
    private String otp;

    public OTPVerificationRequest() {}

    public OTPVerificationRequest(String voterId, String otp) {
        this.voterId = voterId;
        this.otp = otp;
    }

    public String getVoterId() { return voterId; }
    public void setVoterId(String voterId) { this.voterId = voterId; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
