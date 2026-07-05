package com.secure.evoting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class OTPRequest {
    @NotBlank(message = "Voter ID cannot be blank")
    @Pattern(regexp = "^\\d{12}$", message = "Voter ID must be exactly 12 digits")
    private String voterId;
    
    @NotBlank(message = "Password cannot be blank")
    private String password;

    public OTPRequest() {}

    public OTPRequest(String voterId, String password) {
        this.voterId = voterId;
        this.password = password;
    }

    public String getVoterId() { return voterId; }
    public void setVoterId(String voterId) { this.voterId = voterId; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}