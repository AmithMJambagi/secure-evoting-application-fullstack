package com.dummy.voterauthenticatorsimulator.exception;

public class VoterNotEligibleException extends RuntimeException {

    public VoterNotEligibleException() {
        super("The voter is not eligible to vote please contact ECI for further details.");
    }
}