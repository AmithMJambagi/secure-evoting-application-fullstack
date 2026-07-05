package com.secure.evoting.controller;

import com.secure.evoting.dto.MessageResponse;
import com.secure.evoting.dto.VoteRequest;
import com.secure.evoting.security.JwtTokenProvider;
import com.secure.evoting.service.VotingServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
@CrossOrigin(origins = "*") // Allows your React UI dev port to connect seamlessly
public class VotingController {

    private final VotingServiceImpl votingService;
    private final JwtTokenProvider tokenProvider;

    public VotingController(VotingServiceImpl votingService, JwtTokenProvider tokenProvider) {
        this.votingService = votingService;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Accepts an anonymous ballot, validates session tokens, and records the signed vote.
     * Route: POST /api/votes/cast
     */
    @PostMapping("/cast")
    public ResponseEntity<MessageResponse> castVote(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody VoteRequest voteRequest) {

        // 1. Guard against missing or malformed authentication headers
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Access Denied: Missing or malformed token format."));
        }

        // 2. Extract the raw token string
        String token = authHeader.substring(7);

        // 3. Cryptographically validate the token's signature and lifetime expiration
        if (!tokenProvider.validateTokenSignature(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Session expired or invalid. Please re-authenticate."));
        }

        // 4. Extract token claims without executing database queries
        String voterIdHash = tokenProvider.getSubjectFromToken(token);
        String constituencyCode = tokenProvider.getConstituencyFromToken(token);

        // 5. Hand down parameters to the non-blocking service pipeline
        votingService.castBallot(voterIdHash, voteRequest.getCandidateId(), constituencyCode);

        return ResponseEntity.ok(new MessageResponse("Your anonymous ballot has been signed and recorded successfully."));
    }
}