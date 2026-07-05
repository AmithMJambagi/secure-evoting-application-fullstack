package com.secure.evoting.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    private final Key signingKey;
    private final long tokenValidityInMilliseconds;
    private final long adminValidityInMilliseconds;

    // Secret key and custom role expiration paths are securely injected via environment configurations
    public JwtTokenProvider(
            @Value("${security.jwt.token.secret-key}") String secretKey,
            @Value("${security.jwt.token.expire-length:600000}") long expireLength,
            @Value("${security.jwt.token.admin.expire-length:3600000}") long adminExpireLength) {
        
        // Ensure your application yml secret is a high-entropy string at least 256 bits long
        this.signingKey = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.tokenValidityInMilliseconds = expireLength;
        this.adminValidityInMilliseconds = adminExpireLength;
    }

    /**
     * Generates a stateless token string packed with the anonymized identity 
     * hash and the matching voting district scope.
     */
    public String generateToken(String voterIdHash, String constituencyCode) {
        Date now = new Date();
        
        // Voter tokens always route through standard user expiration validity settings (10 mins)
        Date validity = new Date(now.getTime() + tokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject(voterIdHash)                             // Subject is our secure SHA-256 hash
                .claim("constituency", constituencyCode)             // Used by React to pull regional candidate ballots
                .claim("roles", List.of("ROLE_USER"))               // Standard user permission tier
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(signingKey, SignatureAlgorithm.HS512)     // Utilizing your secure injected signingKey
                .compact();
    }

    /**
     * OVERLOADED GENERATOR FOR ADMINISTRATIVE LIFECYCLES:
     * Packs the validated admin username and their respective granted authorities into the signed token claims
     * and dynamically sets a custom session expiration time based on roles.
     */
    public String generateToken(org.springframework.security.core.Authentication authentication) {
        Date now = new Date();

        // 1. Extracts all roles granted to this authenticated principle (e.g., [ROLE_ADMIN])
        List<String> roles = authentication.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(java.util.stream.Collectors.toList());

        // 2. Compute dynamic expiration time frames matching configured role parameters
        long currentValidityPeriod;
        if (roles != null && roles.contains("ROLE_ADMIN")) {
            currentValidityPeriod = adminValidityInMilliseconds; // 1-hour configuration ceiling override
        } else {
            currentValidityPeriod = tokenValidityInMilliseconds; // 10-minute baseline configuration default
        }

        Date validity = new Date(now.getTime() + currentValidityPeriod);

        // 3. Assemble complete token metadata layout array
        return Jwts.builder()
                .setSubject(authentication.getName())               // Subject is the admin username
                .claim("roles", roles)                              // Packs ["ROLE_ADMIN"] dynamically into claims
                .claim("constituency", "GLOBAL_DEVICE_ROOT")        // Admin holds non-restricted device scope access
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(signingKey, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Checks if the token's cryptographic signature remains intact and unexpired.
     */
    public boolean validateTokenSignature(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Malformed, expired, or untrusted signatures drop execution here
            return false;
        }
    }

    /**
     * Extracts the primary User/Voter identity string subject from the validated payload.
     */
    public String getSubjectFromToken(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Extracts the specific granted role claims directly from token memory.
     */
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return getClaims(token).get("roles", List.class);
    }

    /**
     * Extracts the constituency code scope directly from the token string.
     */
    public String getConstituencyFromToken(String token) {
        return getClaims(token).get("constituency", String.class);
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}