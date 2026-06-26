package com.example.demo.repository;

import com.example.demo.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByDonationType(String donationType);
    List<Donation> findByStatus(String status);
    List<Donation> findByDonorEmail(String donorEmail);
}
