package com.s401.moas.project.repository;

import com.s401.moas.project.domain.Position;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PositionRepository extends JpaRepository<Position, Integer> {
}