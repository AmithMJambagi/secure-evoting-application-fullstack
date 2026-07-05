package com.secure.evoting.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secure.evoting.entity.Candidate;
import com.secure.evoting.entity.Constituency;
import com.secure.evoting.repository.CandidateRepository;
import com.secure.evoting.repository.ConstituencyRepository;

@Service
public class PublicService {
	@Autowired
	ConstituencyRepository constituencyRepository;
	 
	 public List<Constituency> getAllConstituency() {
		// TODO Auto-generated method stub
		 List<Constituency> list = new ArrayList<Constituency>();
		 try {
			list=constituencyRepository.findAll();
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return new ArrayList<Constituency>();
		}
		return list;
	 }
}
