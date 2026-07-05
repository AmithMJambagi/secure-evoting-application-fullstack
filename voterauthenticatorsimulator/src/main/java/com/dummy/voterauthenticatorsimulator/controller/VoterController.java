package com.dummy.voterauthenticatorsimulator.controller;

import com.dummy.voterauthenticatorsimulator.entity.Voter;
import com.dummy.voterauthenticatorsimulator.service.VoterService;


import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/voters")
@RequiredArgsConstructor
public class VoterController {

    private final VoterService voterService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Voter createVoter(@RequestBody Voter voter) {

        return voterService.createVoter(voter);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Voter> getAllVoters() {

        return voterService.getAllVoters();
    }

    @GetMapping("/{voterId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Voter getVoter(@PathVariable Long voterId) {

        return voterService.getVoter(voterId);
    }

    @PutMapping("/{voterId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Voter updateVoter(
            @PathVariable Long voterId,
            @RequestBody Voter voter) {

        return voterService.updateVoter(voterId, voter);
    }

    @DeleteMapping("/{voterId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteVoter(
            @PathVariable Long voterId) {

        voterService.deleteVoter(voterId);
    }
    
    @PostMapping("/saveAll")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Voter> addVoters(@RequestBody List<Voter> voters){
    	return voterService.addMultipleVoters(voters);
    }
}