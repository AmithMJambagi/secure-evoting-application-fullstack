package com.secure.evoting.controller;

import com.secure.evoting.entity.Candidate;
import com.secure.evoting.entity.Constituency;
import com.secure.evoting.repository.CandidateRepository;
import com.secure.evoting.service.PublicService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {
	@Autowired
	PublicService publicService;
    private final CandidateRepository candidateRepository;

    public PublicController(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    /**
     * Unauthenticated public access point to browse all standing candidates globally
     * Route: GET /api/public/candidates
     */
    @GetMapping("/candidates")
    public ResponseEntity<List<Candidate>> getAllPublicCandidates() {
        return ResponseEntity.ok(candidateRepository.findAll());
    }
    
    @GetMapping("/constituencies")
    public List<Constituency> getAllByConstituency(){
    	return publicService.getAllConstituency();
    }
}