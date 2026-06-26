package com.example.demo.repository;

import com.example.demo.entity.MissingPerson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MissingPersonRepository extends JpaRepository<MissingPerson, Long> {
    List<MissingPerson> findByStatus(String status);
    List<MissingPerson> findByFullNameContainingIgnoreCase(String name);
    List<MissingPerson> findByLastSeenLocationContainingIgnoreCase(String location);
}
