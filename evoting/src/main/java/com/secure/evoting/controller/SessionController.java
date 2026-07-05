package com.secure.evoting.controller;

import com.secure.evoting.dto.OTPRequest;
import com.secure.evoting.dto.OTPVerificationRequest;
import com.secure.evoting.dto.MessageResponse;
import com.secure.evoting.dto.JwtResponse;
import com.secure.evoting.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    private final AuthenticationService authenticationService;
    
    // Tracks the cooldown timestamp for each active voter ID
    private final ConcurrentHashMap<String, Instant> cooldownTracker = new ConcurrentHashMap<>();

    public SessionController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/request-otp")
    public ResponseEntity<MessageResponse> verifyVoter(@Valid @RequestBody OTPRequest request) {
        String voterId = request.getVoterId();
        Instant now = Instant.now();

        // 1. Atomic Check & Reservation: Look at existing records or claim the slot immediately
        Instant lastRequestTime = cooldownTracker.putIfAbsent(voterId, now);

        if (lastRequestTime != null) {
            // A previous timestamp exists, evaluate if the 150 seconds has elapsed
            if (now.isBefore(lastRequestTime.plusSeconds(150))) {
                long remainingSeconds = 120 - (now.getEpochSecond() - lastRequestTime.getEpochSecond());
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(new MessageResponse("Please wait " + remainingSeconds + " seconds before resending OTP."));
            } else {
                // The old cooldown window expired, update the map with the fresh timestamp
                cooldownTracker.put(voterId, now);
            }
        }

        try {
            // 2. Execute business logic (hashing check + network call to simulator)
            authenticationService.requestOTP(voterId, request.getPassword());
            return ResponseEntity.ok(new MessageResponse("OTP sent successfully"));
            
        } catch (Exception ex) {
            // 3. Rollback the timer if validation or authentication fails
            // This ensures a password typo doesn't lock them out for 2 minutes
            cooldownTracker.remove(voterId);
            throw ex; // Re-throw so our GlobalExceptionHandler can respond with the correct error status
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<JwtResponse> verifyOTP(@Valid @RequestBody OTPVerificationRequest request) {
        JwtResponse response = authenticationService.verifyOTP(request.getVoterId(), request.getOtp());
        
        // Wipe away the cooldown state once authentication completes successfully
        cooldownTracker.remove(request.getVoterId());
        
        return ResponseEntity.ok(response);
    }
}