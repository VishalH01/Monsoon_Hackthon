package com.example.demo.repository;

import com.example.demo.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    Optional<Volunteer> findByEmail(String email);
    List<Volunteer> findByStatus(String status);
    List<Volunteer> findBySkillsContainingIgnoreCase(String skill);
}
