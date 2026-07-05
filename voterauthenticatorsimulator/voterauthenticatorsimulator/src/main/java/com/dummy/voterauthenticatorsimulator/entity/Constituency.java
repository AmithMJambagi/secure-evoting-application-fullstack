package com.dummy.voterauthenticatorsimulator.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "constituencies")
public class Constituency {

    @Id
    @Column(name = "constituency_code", length = 12, nullable = false)
    private String constituencyCode;

    @Column(name = "constituency_name", length = 100, nullable = false)
    private String constituencyName;

    public Constituency() {}

    public Constituency(String constituencyCode, String constituencyName) {
        this.constituencyCode = constituencyCode;
        this.constituencyName = constituencyName;
    }

    // Getters and Setters
    public String getConstituencyCode() { return constituencyCode; }
    public void setConstituencyCode(String constituencyCode) { this.constituencyCode = constituencyCode; }

    public String getConstituencyName() { return constituencyName; }
    public void setConstituencyName(String constituencyName) { this.constituencyName = constituencyName; }
}