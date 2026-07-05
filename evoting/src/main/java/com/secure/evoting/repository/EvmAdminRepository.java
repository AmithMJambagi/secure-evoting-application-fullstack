package com.secure.evoting.repository;

import com.secure.evoting.entity.BallotBox;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EvmAdminRepository extends JpaRepository<BallotBox, Long> {

    /**
     * Executes a high-performance truncate command at the database level 
     * to safely zeroize the memory pool during a wipe operation.
     */
    @Modifying
    @Query(value = "TRUNCATE TABLE ballot_box", nativeQuery = true)
    void zeroizeBallotBoxTable();
    
    /**
     * Grouping Query: Counts votes for candidates within a specific constituency zone.
     * Maps c.name (from Candidate entity) against the counted BallotBox rows.
     */
    @Query("SELECT c.name, COUNT(b) FROM BallotBox b " +
           "JOIN Candidate c ON b.candidateId = c.candidateId " +
           "WHERE b.constituencyCode = :constituencyCode " +
           "GROUP BY c.name")
    List<Object[]> findVoteCountsGroupedByCandidateAndConstituency(@Param("constituencyCode") String constituencyCode);
}