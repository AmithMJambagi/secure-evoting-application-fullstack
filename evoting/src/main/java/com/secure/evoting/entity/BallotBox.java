package com.secure.evoting.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "ballot_box", indexes = {
    // Indexing constituency allows high-speed real-time counting for results
    @Index(name = "idx_ballot_constituency", columnList = "constituency_code")
})
@Setter
@Getter
public class BallotBox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "constituency_code", nullable = false, length = 15)
    private String constituencyCode;

    @Column(name = "cast_at", nullable = false, updatable = false)
    private Instant castAt = Instant.now();

    // Stores the cryptographic signature proving this ballot's authenticity
    @Column(name = "digital_signature", nullable = false, length = 512)
    private String digitalSignature;

    public BallotBox() {}

    public BallotBox(Long candidateId, String constituencyCode, String digitalSignature) {
        this.candidateId = candidateId;
        this.constituencyCode = constituencyCode;
        this.digitalSignature = digitalSignature;
    }
    }