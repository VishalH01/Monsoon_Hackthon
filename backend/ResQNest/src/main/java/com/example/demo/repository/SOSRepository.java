package com.example.demo.repository;

import com.example.demo.entity.SOS;
import com.example.demo.entity.SOSStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SOSRepository extends JpaRepository<SOS, Long> {
    List<SOS> findByStatus(SOSStatus status);
    List<SOS> findByVolunteerUsername(String volunteerUsername);
    List<SOS> findByVictimUsername(String victimUsername);
}
