package com.secure.evoting.dto;

import jakarta.validation.constraints.NotNull;

public class VoteRequest {

    @NotNull(message = "Candidate selection is required.")
    private Long candidateId;

    public VoteRequest() {}

    public VoteRequest(Long candidateId) {
        this.candidateId = candidateId;
    }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }
}