package com.example.demo.repository;

import com.example.demo.entity.Shelter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, Long> {
    List<Shelter> findByStatus(String status);
    List<Shelter> findByNameContainingIgnoreCase(String name);
}
