package com.dummy.voterauthenticatorsimulator.exception;

public class InvalidPasswordException extends RuntimeException {
	
	public InvalidPasswordException() {
		super("Oops!!! the password is wrong!!");
	}
}
