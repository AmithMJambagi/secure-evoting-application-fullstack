package com.secure.evoting.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users", indexes = {
    // Highly efficient B-Tree index for O(1) SHA-256 lookups
    @Index(name = "idx_voter_id_hash", columnList = "voter_id_hash", unique = true)
})
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Stores the secure, irreversible 64-character SHA-256 hash of the Voter ID
    @Column(name = "voter_id_hash", nullable = false, unique = true, updatable = false, length = 64)
    private String voterIdHash;

    @Column(name = "has_voted", nullable = false)
    private boolean hasVoted = false;

    // Tracks the current active JWT signature fragment to block concurrent sessions
    @Column(name = "active_token_signature", length = 255)
    private String activeTokenSignature;

    @Column(name = "constituency_code", nullable = false, length = 15)
    private String constituencyCode;
    
    public User() {}

    public User(String voterIdHash, String constituencyCode) {
        this.voterIdHash = voterIdHash;
        this.constituencyCode = constituencyCode;
        this.hasVoted = false;
    }

   
}