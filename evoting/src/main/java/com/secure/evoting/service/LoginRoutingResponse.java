package com.secure.evoting.service;

public class LoginRoutingResponse {
    private final String status; // ALREADY_VOTED, TRIGGER_2FA, ROUTE_TO_VOTE
    private final String messageOrToken;
    private final String constituencyCode;

    public LoginRoutingResponse(String status, String messageOrToken, String constituencyCode) {
        this.status = status;
        this.messageOrToken = messageOrToken;
        this.constituencyCode = constituencyCode;
    }

    public String getStatus() { return status; }
    public String getMessageOrToken() { return messageOrToken; }
    public String getConstituencyCode() { return constituencyCode; }
}