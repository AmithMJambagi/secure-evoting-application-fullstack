package com.secure.evoting.dto;

import jakarta.validation.constraints.NotBlank;

public class SimulatorTokenRequestDto {

    @NotBlank(message = "Simulator JWT token string cannot be empty")
    private String token;

    public SimulatorTokenRequestDto() {}

    public SimulatorTokenRequestDto(String token) {
        this.token = token;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}