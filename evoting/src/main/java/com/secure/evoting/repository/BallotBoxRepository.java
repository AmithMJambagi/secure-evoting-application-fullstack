package com.secure.evoting.repository;

import java.util.stream.Stream;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;

import com.secure.evoting.entity.BallotBox;

public interface BallotBoxRepository extends JpaRepository<BallotBox, Long>{
	// Streams rows one-by-one from the database driver cursor rather than fetching a giant chunk
	Page<BallotBox> findAll(Pageable pageable);
	
	long countByConstituencyCode(String constituencyCode);
}
