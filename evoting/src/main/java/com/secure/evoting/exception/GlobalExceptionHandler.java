package com.secure.evoting.exception;

import com.secure.evoting.dto.MessageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(SimulatorAuthenticationException.class)
    public ResponseEntity<MessageResponse> handleSimulatorAuthenticationException(SimulatorAuthenticationException ex) {
        // Wrap the raw string message into your existing MessageResponse JSON DTO
        MessageResponse errorBody = new MessageResponse(ex.getMessage());
        
        // Return the dynamic status code along with the structured JSON body
        return new ResponseEntity<>(errorBody, ex.getStatusCode());
    }
}