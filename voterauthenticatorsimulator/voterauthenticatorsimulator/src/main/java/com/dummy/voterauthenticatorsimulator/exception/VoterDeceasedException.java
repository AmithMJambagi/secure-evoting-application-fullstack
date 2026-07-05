package com.dummy.voterauthenticatorsimulator.exception;

public class VoterDeceasedException extends RuntimeException {

    public VoterDeceasedException() {
        super("The voter is marked as deceased and is not eligible to vote please contact ECI for further details.");
    }
}