package com.secure.evoting.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "candidate", 
    indexes = {
        @Index(name = "idx_candidate_constituency", columnList = "constituency_code")
    }
)
@Setter
@Getter
public class Candidate {

	@Id
	@Column(name = "candidate_id", nullable = false, updatable = false)
	@Min(value = 10000000, message = "Candidate ID must be exactly 8 digits")
	@Max(value = 99999999, message = "Candidate ID must be exactly 8 digits")
	private Long candidateId; // Standardized 8-digit unique identifier

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String party;

    @Column(name = "party_symbol", nullable = false, length = 50)
    private String partySymbol; // Stores file names or identifiers (e.g., "lotus.png", "hand.png")

    @Column(name = "constituency_code", nullable = false, length = 12)
    private String constituencyCode; // Matches your strict 12-character format
    
    private String constituencyName;
    public Candidate() {}

    public Candidate(Long candidateId, String name, String party, String partySymbol, String constituencyCode) {
        this.candidateId = candidateId;
        this.name = name;
        this.party = party;
        this.partySymbol = partySymbol;
        this.constituencyCode = constituencyCode;
    }
}