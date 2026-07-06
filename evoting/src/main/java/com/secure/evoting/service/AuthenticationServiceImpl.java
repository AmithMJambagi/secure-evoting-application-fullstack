package com.secure.evoting.service;



import com.nimbusds.jose.crypto.DirectDecrypter;
import com.nimbusds.jwt.EncryptedJWT;
import com.nimbusds.jwt.JWTClaimsSet;
import com.secure.evoting.dto.JwtResponse;
import com.secure.evoting.dto.OTPRequest;
import com.secure.evoting.dto.OTPVerificationRequest;
import com.secure.evoting.entity.User;
import com.secure.evoting.exception.SimulatorAuthenticationException;
import com.secure.evoting.repository.UserRepository;
import com.secure.evoting.security.JwtTokenProvider;

import lombok.val;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {

    private final RestTemplate restTemplate;

    // URL pointing to your standalone Dummy Simulator port 
    @Value("${app.simulator.url}")
    private String simulatorUrl;
    
    @Value("${app.simulator.jwt-secret}")
    private String SECRET;
    private UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    public AuthenticationServiceImpl(RestTemplate restTemplate,UserRepository userRepository,JwtTokenProvider tokenProvider) {
        this.restTemplate = restTemplate;
        this.userRepository = userRepository;
        this.tokenProvider=tokenProvider;
    }


    
    private String generateSecureSHA256(String rawVoterId) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(rawVoterId.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Cryptographic hashing execution failure", e);
        }
    }
    @Override
    public void requestOTP(String voterId, String password) {
        // 1. Compute the secure hash of the incoming voterId
        String computedHash = generateSecureSHA256(voterId);

        // 2. Query our minimalist index to see if they have a "hasVoted = true" footprint
        Optional<Boolean> hasVotedOpt = userRepository.checkHasVotedByHash(computedHash);
        
        if (hasVotedOpt.isPresent() && hasVotedOpt.get()) {
            // Short-circuit user already voted no need to request otp
            throw new SimulatorAuthenticationException(HttpStatus.BAD_REQUEST, "Thanks for voting!");
        }

        // 3. If they are NOT present in the table, OR they are present but "hasVoted == false", 
        String url = simulatorUrl + "/request-otp";
        
        OTPRequest simulatorRequest = new OTPRequest();
        simulatorRequest.setVoterId(voterId);
        simulatorRequest.setPassword(password);

        try {
            restTemplate.postForEntity(url, simulatorRequest, Void.class);
        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            String responseBody = ex.getResponseBodyAsString();
            String message = responseBody.isBlank() ? "Authentication failed at simulator" : responseBody;
            throw new SimulatorAuthenticationException(ex.getStatusCode(), message);
            }
        }

    
    

    @Override
    @Transactional
    public JwtResponse verifyOTP(String voterId, String otpCode) {
        // 1. Post the OTP verification details across to the external simulator
        String url = simulatorUrl + "/verify-otp";
        OTPVerificationRequest simulatorVerifyRequest = new OTPVerificationRequest(voterId, otpCode);

        ResponseEntity<JwtResponse> response;
        try {
            response = restTemplate.postForEntity(url, simulatorVerifyRequest, JwtResponse.class);
        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            String responseBody = ex.getResponseBodyAsString();
            String message = responseBody.isBlank() ? "OTP Verification failed" : responseBody;
            throw new SimulatorAuthenticationException(ex.getStatusCode(), message);
        }

        JwtResponse simulatorJwtResponse = response.getBody();
        if (simulatorJwtResponse == null || simulatorJwtResponse.getToken() == null) {
            throw new SimulatorAuthenticationException(HttpStatus.UNAUTHORIZED, "Invalid token response from external authenticator.");
        }

        // 2. Cryptographically decrypt the JWE payload from the simulator
        try {
            EncryptedJWT jweObject = EncryptedJWT.parse(simulatorJwtResponse.getToken());
            
            // Derive the 32-byte (256-bit) symmetric AES key block from our shared secret string
            byte[] keyBytes = new byte[32];
            System.arraycopy(SECRET.getBytes(), 0, keyBytes, 0, Math.min(SECRET.getBytes().length, 32));
            
            // Decrypt down to cleartext claims
            jweObject.decrypt(new DirectDecrypter(keyBytes));
            JWTClaimsSet claims = jweObject.getJWTClaimsSet();

            Boolean isEligible = claims.getBooleanClaim("eligible");
            String constituencyCode = claims.getStringClaim("constituencyCode");

            // Enforce basic legal voting requirements flagged by ECI simulator
            if (isEligible == null || !isEligible) {
                throw new SimulatorAuthenticationException(HttpStatus.FORBIDDEN, "User is not legally eligible to vote.");
            }

            // 3. Complete the Anonymized Bookkeeping Layout
            String computedHash = generateSecureSHA256(voterId);
            User user = userRepository.findByVoterIdHash(computedHash).orElse(null);

            if (user != null) {
                if (user.isHasVoted()) {
                    throw new SimulatorAuthenticationException(HttpStatus.OK, "Thanks for voting!");
                }
            } else {
                // First time login registration: provision a minimal anonymous tracker
                user = new User();
                user.setVoterIdHash(computedHash);
                user.setConstituencyCode(constituencyCode);
                user.setHasVoted(false); // They have authenticated, but haven't chosen a candidate yet
            }

            // 4. Issuing our own clean internal application JWT session to pass back to Frontend
            String appToken = tokenProvider.generateToken(user.getVoterIdHash(), user.getConstituencyCode());
            String tokenSignature = appToken.substring(appToken.lastIndexOf(".") + 1);

            // 2. Lock the simultaneous session tracker
            user.setActiveTokenSignature(tokenSignature);
            userRepository.save(user);

            // 3. Match your exact DTO constructor: public JwtResponse(String token, String status, String constituencyCode)
            return new JwtResponse(appToken, "ROUTE_TO_VOTE", user.getConstituencyCode());

        } catch (SimulatorAuthenticationException ex) {
            throw ex;
        } catch (Exception e) {
            throw new SimulatorAuthenticationException(HttpStatus.INTERNAL_SERVER_ERROR, "Cryptographic decryption pipeline failure: " + e.getMessage());
        }
    }
}