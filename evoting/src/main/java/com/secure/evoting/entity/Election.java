package com.secure.evoting.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;

@Entity
@Table(name = "election")
public class Election {

    // Natural Key explicitly typed and assigned by admin (e.g., constituency_code + year)
    @Id
    @Column(name = "id", nullable = false, length = 50)
    private String id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "constituency_code", nullable = false, length = 12)
    @Pattern(regexp = "\\d{12}", message = "Constituency code must be exactly 12 digits")
    private String constituencyCode;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = false;

    // Getters, Setters, Constructors
}
