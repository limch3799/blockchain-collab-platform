package com.s401.moas.region.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.s401.moas.region.domain.District;

@Repository
public interface DistrictRepository extends JpaRepository<District, Integer> {
    Optional<District> findByCode(String code);
}

