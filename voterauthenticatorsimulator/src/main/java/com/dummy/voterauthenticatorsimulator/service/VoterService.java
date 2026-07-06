package com.dummy.voterauthenticatorsimulator.service;

import com.dummy.voterauthenticatorsimulator.entity.Voter;
import com.dummy.voterauthenticatorsimulator.repository.VoterRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.dummy.voterauthenticatorsimulator.config.SecurityConfig;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoterService {
	private final PasswordEncoder passwordEncoder;
    private final VoterRepository voterRepository;

    public Voter createVoter(Voter voter) {
    	 voter.setPassword(
    	            passwordEncoder.encode(voter.getPassword()));
        return voterRepository.save(voter);
    }

    public List<Voter> getAllVoters() {

        return voterRepository.findAll();
    }

    public Voter getVoter(Long voterId) {

        return voterRepository.findById(voterId)
                .orElseThrow(() ->
                        new RuntimeException("Voter not found"));
    }

    public Voter updateVoter(Long voterId, Voter updatedVoter) {

        Voter voter = voterRepository.findById(voterId)
                .orElseThrow(() ->
                        new RuntimeException("Voter not found"));
         String encryptedPassword=passwordEncoder.encode(updatedVoter.getPassword());
        voter.setFirstName(updatedVoter.getFirstName());
        voter.setMiddleName(updatedVoter.getMiddleName());
        voter.setLastName(updatedVoter.getLastName());
        voter.setEmail(updatedVoter.getEmail());
        voter.setPassword(encryptedPassword);
        voter.setAddress(updatedVoter.getAddress());
        voter.setBirthDate(updatedVoter.getBirthDate());
        voter.setDeathDate(updatedVoter.getDeathDate());
        voter.setEligibleToVote(updatedVoter.isEligibleToVote());
        voter.setConstituencyCode(updatedVoter.getConstituencyCode());
        voter.setConstituencyName(updatedVoter.getConstituencyName());
        voter.setPinCode(updatedVoter.getPinCode());

        return voterRepository.save(voter);
    }

    public void deleteVoter(Long voterId) {

        voterRepository.deleteById(voterId);
    }

	public List<Voter> addMultipleVoters(List<Voter> voters) {
		if(voters!=null) {
			for(Voter voter:voters) {
				voter.setPassword(
	    	            passwordEncoder.encode(voter.getPassword()));
				voterRepository.save(voter);
			}
		}
		return voters;
	}
}