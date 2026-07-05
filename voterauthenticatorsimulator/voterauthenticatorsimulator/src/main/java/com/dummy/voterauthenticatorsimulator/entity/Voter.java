package com.dummy.voterauthenticatorsimulator.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;
@Entity
@Table(name = "voters")
@Setter
@Getter
public class Voter {

   
	@Id
	@Column(name = "voter_id")
    private Long voterId;

    private String firstName;
    private String middleName;
    private String lastName;
    private String password;
    private String email;

    private LocalDate birthDate;
    private LocalDate deathDate;

    private boolean eligibleToVote;
    @Pattern(
    	    regexp = "^[A-Z0-9-]{12}$",
    	    message = "Constituency code must be exactly 12 characters containing uppercase letters, numbers, or hyphens"
    	)
    	private String constituencyCode;
    
    private String constituencyName;

    private String address;
    private String district;
    private String state;
    private String pinCode;

    private boolean verified;
}