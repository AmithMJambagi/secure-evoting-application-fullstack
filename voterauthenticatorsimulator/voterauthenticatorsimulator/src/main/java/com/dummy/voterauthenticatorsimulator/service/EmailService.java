package com.dummy.voterauthenticatorsimulator.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.dummy.voterauthenticatorsimulator.exception.*;
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOTP(String email, String otp){

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("E-Voting Authentication OTP");

        message.setText(
                "Dear Voter,\n\n" +
                "Your One-Time Password (OTP) is: " + otp +
                "\n\nIt is valid for 5 minutes." +
                "\n\nDummy ECI");

        try {
            mailSender.send(message);
        } catch (Exception ex) {
            throw new EmailDeliveryException(ex);
        }
    }
}