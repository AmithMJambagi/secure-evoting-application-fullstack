package com.dummy.voterauthenticatorsimulator.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.dummy.voterauthenticatorsimulator.entity.Voter;

@Repository
public interface VoterRepository extends JpaRepository<Voter,Long> {

}
