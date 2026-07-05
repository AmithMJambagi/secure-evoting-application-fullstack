package com.dummy.voterauthenticatorsimulator.exception;
public class VoterNotFoundException extends RuntimeException {

    public VoterNotFoundException(Long voterId) {
        super("Voter with ID " + voterId + " was not found please contact ECI for further details.");
    }
}