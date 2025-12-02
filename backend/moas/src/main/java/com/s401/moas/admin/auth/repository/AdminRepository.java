package com.s401.moas.admin.auth.repository;

import com.s401.moas.admin.auth.domain.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Integer> {

    Optional<Admin> findByLoginIdAndDeletedAtIsNull(String loginId);

    boolean existsByLoginIdAndDeletedAtIsNull(String loginId);
}