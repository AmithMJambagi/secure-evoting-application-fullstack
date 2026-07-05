package com.secure.evoting.controller;

import com.secure.evoting.security.JwtTokenProvider; // Import your exact provider component class
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class EvmAdminAuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider; // Updated type target matching your class profile name

    public EvmAdminAuthController(AuthenticationManager authenticationManager, 
                                  JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateAdminSession(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Dynamically invokes the newly added overloaded generator method block
            String generatedAdminJwt = tokenProvider.generateToken(authentication);

            Map<String, Object> sessionResponse = new HashMap<>();
            sessionResponse.put("token", generatedAdminJwt);
            sessionResponse.put("username", username);
            sessionResponse.put("role", "ROLE_ADMIN");

            return ResponseEntity.ok(sessionResponse);

        } catch (Exception e) {
            Map<String, String> errorDetails = new HashMap<>();
            errorDetails.put("error", "Unauthorized access signature. Invalid administrative credentials.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
        }
    }
}