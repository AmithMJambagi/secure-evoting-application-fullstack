package com.secure.evoting.repository;

import com.secure.evoting.entity.Constituency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConstituencyRepository extends JpaRepository<Constituency, String> {
    // Basic CRUD operations are inherited automatically
}