package com.secure.evoting.service;

import com.secure.evoting.entity.BallotBox;
import com.secure.evoting.entity.Candidate;
import com.secure.evoting.entity.Constituency;
import com.secure.evoting.repository.BallotBoxRepository;
import com.secure.evoting.repository.CandidateRepository;
import com.secure.evoting.repository.UserRepository;
import com.secure.evoting.repository.EvmAdminRepository;
import com.secure.evoting.repository.ConstituencyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
public class EvmAdminServiceImpl {

    private final VotingServiceImpl votingService; 
    private final BallotBoxRepository ballotBoxRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final EvmAdminRepository evmAdminRepository;
    private final ConstituencyRepository constituencyRepository;

    public EvmAdminServiceImpl(VotingServiceImpl votingService,
                               BallotBoxRepository ballotBoxRepository,
                               CandidateRepository candidateRepository,
                               UserRepository userRepository,
                               EvmAdminRepository evmAdminRepository,
                               ConstituencyRepository constituencyRepository) {
        this.votingService = votingService;
        this.ballotBoxRepository = ballotBoxRepository;
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.evmAdminRepository = evmAdminRepository;
        this.constituencyRepository = constituencyRepository;
    }
    
    
    public boolean verifyBallotIntegrity(BallotBox vote) {
        if (vote == null || vote.getDigitalSignature() == null) {
            return false;
        }
        String rawBallotData = vote.getCandidateId() + "|" + vote.getConstituencyCode();
        String expectedSignature = votingService.generateBallotSignature(rawBallotData);

        return MessageDigest.isEqual(
            vote.getDigitalSignature().getBytes(StandardCharsets.UTF_8),
            expectedSignature.getBytes(StandardCharsets.UTF_8)
        );
    }

    public void auditBallotBox() {
        Iterable<BallotBox> allVotes = ballotBoxRepository.findAll();
        long tamperedCount = 0;

        for (BallotBox vote : allVotes) {
            if (!verifyBallotIntegrity(vote)) {
                tamperedCount++;
            }
        }
        if (tamperedCount > 0) {
            throw new SecurityException("CRITICAL AUDIT FAILURE: " + tamperedCount + " tampered ballot records found in the database!");
        }
    }
    
   
    @Transactional(readOnly = true)
    public Map<String, Object> computeConstituencyMetrics(String constituencyCode) {
        // 1. Initialize the standings map with ALL candidates for this constituency set to 0 votes
        Map<String, Long> candidateStandings = new HashMap<>();
        
        try {
            List<Candidate> allLocalCandidates = candidateRepository.findByConstituencyCode(constituencyCode);
            for (Candidate cand : allLocalCandidates) {
                // Use a composite key tracking both Candidate Name and their unique ID
                String identifierKey = cand.getName() + " (ID: " + cand.getCandidateId() + ")";
                candidateStandings.put(identifierKey, 0L);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 2. Fetch active grouped vote matrices from the repository layer
        List<Object[]> queryRows = evmAdminRepository.findVoteCountsGroupedByCandidateAndConstituency(constituencyCode);

        // 3. Match candidate names with their IDs and overwrite vote counts
        for (Object[] row : queryRows) {
            String candidateName = (String) row[0];
            Long totalVotes = (Long) row[1];
            
            // Find the map entry that matches the name prefix and update its value
            for (String key : candidateStandings.keySet()) {
                if (key.startsWith(candidateName + " (ID:")) {
                    candidateStandings.put(key, totalVotes);
                    break;
                }
            }
        }

        // 4. Calculate winner and margins
        String dynamicWinner = "No Ballots Cast";
        long maximumVotes = -1;

        for (Map.Entry<String, Long> entry : candidateStandings.entrySet()) {
            long totalVotes = entry.getValue();
            if (totalVotes > maximumVotes) {
                maximumVotes = totalVotes;
                dynamicWinner = entry.getKey();
            }
        }

        Map<String, Object> responseMatrix = new HashMap<>();
        responseMatrix.put("standings", candidateStandings);
        responseMatrix.put("winner", dynamicWinner);
        responseMatrix.put("winningMargin", maximumVotes > -1 ? maximumVotes : 0);

        return responseMatrix;
    }

    @Transactional(readOnly = true)
    public List<Constituency> getAllRegisteredConstituencies() {
        return constituencyRepository.findAll();
    }

    @Transactional
    public void provisionDeviceBallot(List<Candidate> candidates) {
        if (candidateRepository.count() > 0) {
            throw new IllegalStateException("EVM Error: Machine already provisioned for this election cycle.");
        }
        candidateRepository.saveAll(candidates);
    }

    @Transactional
    public void zeroizeApplianceState() {
        this.auditBallotBox(); 
        evmAdminRepository.zeroizeBallotBoxTable();
        candidateRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        constituencyRepository.deleteAllInBatch();
    }

    @Transactional(readOnly = true)
    public List<Map<String, String>> getDetailedTamperReport() {
        List<Map<String, String>> tamperReportList = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        Map<String, String> nameCache = new HashMap<>();

        // 1. CHUNKED BALLOT-LEVEL ROW SCAN (Validates individual cryptographic row signatures)
        int pageSize = 1000;
        Pageable pageable = PageRequest.of(0, pageSize);
        Page<BallotBox> votePage;

        do {
            votePage = ballotBoxRepository.findAll(pageable);
            
            for (BallotBox vote : votePage.getContent()) {
                if (!verifyBallotIntegrity(vote)) {
                    Map<String, String> tamperDetails = new HashMap<>();
                    String code = vote.getConstituencyCode() != null ? vote.getConstituencyCode() : "UNKNOWN_CODE";
                    
                    String name = nameCache.computeIfAbsent(code, cCode -> 
                        constituencyRepository.findById(cCode)
                            .map(Constituency::getConstituencyName)
                            .orElse("Unknown District Area")
                    );

                    String timestampStr = vote.getCastAt() != null 
                            ? vote.getCastAt().atZone(java.time.ZoneId.systemDefault()).format(formatter) 
                            : "N/A";
                    
                    tamperDetails.put("ballotId", vote.getId() != null ? String.valueOf(vote.getId()) : "N/A");
                    tamperDetails.put("constituencyName", name);
                    tamperDetails.put("constituencyCode", code);
                    tamperDetails.put("timestamp", timestampStr);
                    tamperDetails.put("violationType", "CRYPTOGRAPHIC_SIGNATURE_MISMATCH");

                    tamperReportList.add(tamperDetails);
                }
            }
            
            pageable = pageable.next();
        } while (votePage.hasNext());

        // 2. REGIONAL TURNOUT RECONCILIATION CHECK (Matches ledger totals table-to-table)
        try {
            List<Constituency> constituencies = constituencyRepository.findAll();
            for (Constituency c : constituencies) {
                String code = c.getConstituencyCode();
                
                // Query counts from respective table indexes
                long totalBallotsInBox = ballotBoxRepository.countByConstituencyCode(code);
                long totalUsersMarkedVoted = userRepository.countVotedUsersByConstituency(code);

                // Discrepancy caught: Injected phantom votes discovered inside the ballot box
                if (totalBallotsInBox > totalUsersMarkedVoted) {
                    Map<String, String> varianceDetails = new HashMap<>();
                    varianceDetails.put("ballotId", "REGION_ALERT");
                    varianceDetails.put("constituencyName", c.getConstituencyName());
                    varianceDetails.put("constituencyCode", code);
                    varianceDetails.put("timestamp", java.time.LocalDateTime.now().format(formatter));
                    varianceDetails.put("violationType", "TURNOUT_MISMATCH: Box contains " + totalBallotsInBox 
                            + " ballots, but user ledger only tracks " + totalUsersMarkedVoted + " authenticated voters.");

                    tamperReportList.add(varianceDetails);
                }
            }
        } catch (Exception e) {
            System.err.println("Reconciliation calculation suspended: check repository entity binding configurations.");
            e.printStackTrace();
        }

        return tamperReportList;
    }

    /**
     * Pulls the verified candidate profiles matching a specific voting region container.
     */
    public List<Candidate> getAllByConstituency(Constituency constituency) {
        if (constituency == null || constituency.getConstituencyCode() == null) {
            return new ArrayList<>();
        }
        
        try {
            return candidateRepository.findByConstituencyCode(constituency.getConstituencyCode());
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }


	public List<Candidate> addCandidates(List<Candidate> candidates) {
		if(candidates!=null) {
			for(Candidate candidate : candidates) {
				candidateRepository.save(candidate);
			}
		}
		return candidates;
	}
}