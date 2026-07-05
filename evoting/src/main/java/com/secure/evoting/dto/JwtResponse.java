package com.secure.evoting.dto;



	public class JwtResponse {
	    private String token;
	    private String status;
	    private String constituencyCode;
	
	    public JwtResponse() {}
	    public JwtResponse(String token, String status, String constituencyCode) {
	        this.token = token;
	        this.status = status;
	        this.constituencyCode = constituencyCode;
	    }
	
	    public String getToken() { return token; }
	    public void setToken(String token) { this.token = token; }
	    public String getStatus() { return status; }
	    public void setStatus(String status) { this.status = status; }
	    public String getConstituencyCode() { return constituencyCode; }
	    public void setConstituencyCode(String constituencyCode) { this.constituencyCode = constituencyCode; }
	}