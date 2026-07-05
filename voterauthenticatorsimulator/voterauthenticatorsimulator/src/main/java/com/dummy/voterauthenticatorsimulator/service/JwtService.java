package com.dummy.voterauthenticatorsimulator.service;

import java.security.Key;
import java.util.Date;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.dummy.voterauthenticatorsimulator.entity.Voter;
import com.nimbusds.jose.EncryptionMethod;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWEAlgorithm;
import com.nimbusds.jose.JWEEncrypter;
import com.nimbusds.jose.JWEHeader;
import com.nimbusds.jose.crypto.DirectEncrypter;
import com.nimbusds.jwt.EncryptedJWT;
import com.nimbusds.jwt.JWTClaimsSet;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JwtService {
    private final String secret;

    public JwtService(@Value("${app.auth.jwt-secret}") String secret) {
        this.secret = secret;
    }
//	 old implementation without encryption
//	 private final String secret = "";
//
//    private final Key key = new SecretKeySpec(
//            SECRET.getBytes(),
//            SignatureAlgorithm.HS256.getJcaName());
//
//    public String generateToken(Voter voter) {
//
//        return Jwts.builder()
//                .setSubject(String.valueOf(voter.getVoterId()))
//                .claim("eligible", voter.isEligibleToVote())
//                .claim("constituencyCode",
//                        voter.getConstituencyCode())
//                .claim("email", voter.getEmail())
//                .claim("firstName", voter.getFirstName())
//                .claim("lastName", voter.getLastName())
//                .setIssuer("Dummy-Voter-Authenticator ECI")
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + 1800000))
//                .signWith(key, SignatureAlgorithm.HS512)
//                .compact();
//    }
	
	public String generateToken(Voter voter) {
	    // Reconstruct the key ensuring the key length meets cryptographic requirements
	    Key sharedKey = new SecretKeySpec(secret.getBytes(), "AES");

	    try {
            // 1. Build your targeted citizen claims payload
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(String.valueOf(voter.getVoterId()))
                    .claim("eligible", voter.isEligibleToVote())
                    .claim("constituencyCode", voter.getConstituencyCode())
                    .claim("email", voter.getEmail())
                    .claim("firstName", voter.getFirstName())
                    .claim("lastName", voter.getLastName())
                    .issuer("Dummy-Voter-Authenticator ECI")
                    .issueTime(new Date())
                    .expirationTime(new Date(System.currentTimeMillis() + 1800000))
                    .build();

            // 2. Define JWE Headers specifying Direct Key Encryption (DIR) and AES-GCM 256
            JWEHeader header = new JWEHeader(JWEAlgorithm.DIR, EncryptionMethod.A256GCM);

            // 3. Derive a rigid 32-byte (256-bit) AES key block from your secret string
            byte[] keyBytes = new byte[32];
            System.arraycopy(secret.getBytes(), 0, keyBytes, 0, Math.min(secret.getBytes().length, 32));

            // 4. Create the Encrypter and package the payload
            JWEEncrypter encrypter = new DirectEncrypter(keyBytes);
            EncryptedJWT jweObject = new EncryptedJWT(header, claimsSet);

            // 5. Execute Encryption
            jweObject.encrypt(encrypter);

            // Returns a totally obscured, unreadable 5-part JWE compact string block
            return jweObject.serialize();

        } catch (JOSEException e) {
            throw new RuntimeException("Cryptographic JWE construction failed", e);
        }
	}
	
}