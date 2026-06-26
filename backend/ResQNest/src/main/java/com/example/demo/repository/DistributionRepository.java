package com.example.demo.repository;

import com.example.demo.entity.Distribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DistributionRepository extends JpaRepository<Distribution, Long> {
    List<Distribution> findByStatus(String status);
    List<Distribution> findByInventoryId(Long inventoryId);
    List<Distribution> findByVolunteerId(Long volunteerId);
}
