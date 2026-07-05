package com.secure.evoting.security.config;

public enum UserRole {
    USER,               // Standard citizen; can browse active elections & candidates
    VERIFIED_VOTER,     // Passed the dummy identity gatekeeper; authorized to call POST /votes
    REGISTRAR,          // Administrative access: can authorize or suspend individual voter identity hashes
    AUDITOR             // Public/Internal auditor: read-only ledger validation visibility
}