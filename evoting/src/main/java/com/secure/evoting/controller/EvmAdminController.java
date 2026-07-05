package com.secure.evoting.controller;

import com.secure.evoting.entity.Candidate;
import com.secure.evoting.entity.Constituency;
import com.secure.evoting.service.EvmAdminServiceImpl;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/evm-management")
@CrossOrigin(origins = "http://localhost:5173") // Adjust port matching your deployment choice
@PreAuthorize("hasRole('ADMIN')") // Level 1 Class Lockdown: Forces strict role checks
public class EvmAdminController {

    private final EvmAdminServiceImpl evmAdminService;

    public EvmAdminController(EvmAdminServiceImpl evmAdminService) {
        this.evmAdminService = evmAdminService;
    }

    @GetMapping("/constituencies")
    public ResponseEntity<List<Constituency>> getConstituencies() {
        return ResponseEntity.ok(evmAdminService.getAllRegisteredConstituencies());
    }

    @GetMapping("/constituency-tally/{code}")
    public ResponseEntity<Map<String, Object>> getConstituencyTally(@PathVariable String code) {
        return ResponseEntity.ok(evmAdminService.computeConstituencyMetrics(code));
    }

    @PostMapping("/provision")
    public ResponseEntity<String> loadBallotSlots(@RequestBody List<Candidate> candidates) {
        evmAdminService.provisionDeviceBallot(candidates);
        return ResponseEntity.ok("EVM Initialization Phase Complete: Ballot slots securely mapped.");
    }

    @PostMapping("/zeroize")
    public ResponseEntity<String> executeDeviceWipe() {
        evmAdminService.zeroizeApplianceState();
        return ResponseEntity.ok("EVM Memory Decommissioned Successfully. System container memory zeroed out.");
    }
    
    @PostMapping("/candidates")
    public List<Candidate> getAllByConstituency(@RequestBody Constituency constituency){
    	return evmAdminService.getAllByConstituency(constituency);
    }
    
    @GetMapping("/tamper-report")
    public ResponseEntity<List<Map<String, String>>> getTamperReport() {
        // Triggers the high-speed chunked database scan partition loop
        return ResponseEntity.ok(evmAdminService.getDetailedTamperReport());
    }
    @PostMapping("/savecandidates")
    @ResponseStatus(HttpStatus.CREATED)
    public List<Candidate> addCandidates(@RequestBody List<Candidate> candidates){
    	return evmAdminService.addCandidates(candidates);
    }
}