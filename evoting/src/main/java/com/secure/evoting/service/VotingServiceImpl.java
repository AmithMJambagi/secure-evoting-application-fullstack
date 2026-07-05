package com.secure.evoting.service;

import com.secure.evoting.entity.BallotBox;
import com.secure.evoting.repository.BallotBoxRepository;
import com.secure.evoting.repository.UserRepository;
import com.secure.evoting.exception.SimulatorAuthenticationException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class VotingServiceImpl {

    private final UserRepository userRepository;
    private final BallotBoxRepository ballotBoxRepository;
    
    // Using a system-level secure signing key to sign individual votes against tampering
    @Value("${app.ballot.algorithm}")
    private String SIGNING_ALGORITHM;

    @Value("${app.ballot.secret}")
    private String BALLOT_SECRET;

    public VotingServiceImpl(UserRepository userRepository, BallotBoxRepository ballotBoxRepository) {
        this.userRepository = userRepository;
        this.ballotBoxRepository = ballotBoxRepository;
    }

    @Transactional
    public void castBallot(String voterIdHash, Long candidateId, String tokenConstituency) {
        
        // 1. Attempt an atomic state update. If it returns 0, the user has already voted or doesn't exist.
        int rowsUpdated = userRepository.markAsVotedAtomic(voterIdHash);
        if (rowsUpdated == 0) {
            throw new SimulatorAuthenticationException(HttpStatus.BAD_REQUEST, "Vote rejected: Already voted or session invalid.");
        }

        // 2. Cryptographically sign the raw data block to prevent database manipulation
        String rawBallotData = candidateId + "|" + tokenConstituency;
        String digitalSignature = generateBallotSignature(rawBallotData);

        // 3. Drop the unlinked, signed, completely anonymous vote into the ballot box
        BallotBox vote = new BallotBox(candidateId, tokenConstituency, digitalSignature);
        ballotBoxRepository.save(vote);
    }

    protected String generateBallotSignature(String data) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(BALLOT_SECRET.getBytes(StandardCharsets.UTF_8), SIGNING_ALGORITHM);
            Mac mac = Mac.getInstance(SIGNING_ALGORITHM);
            mac.init(secretKey);
            byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate secure cryptographic ballot signature", e);
        }
    }
}