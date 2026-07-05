package com.secure.evoting.repository;

import com.secure.evoting.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Index-only scan projection: minimizes JVM memory allocations
    @Query("SELECT u.hasVoted FROM User u WHERE u.voterIdHash = :voterIdHash")
    Optional<Boolean> checkHasVotedByHash(@Param("voterIdHash") String voterIdHash);
    
    @Modifying
    @Query("UPDATE User u SET u.hasVoted = true, u.activeTokenSignature = null WHERE u.voterIdHash = :voterIdHash AND u.hasVoted = false")
    int markAsVotedAtomic(@Param("voterIdHash") String voterIdHash);

    Optional<User> findByVoterIdHash(String voterIdHash);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.constituencyCode = :code AND u.hasVoted = true")
    long countVotedUsersByConstituency(@Param("code") String constituencyCode);
}