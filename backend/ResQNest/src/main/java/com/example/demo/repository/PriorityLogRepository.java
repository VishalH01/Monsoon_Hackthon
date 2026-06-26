package com.example.demo.repository;

import com.example.demo.entity.PriorityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PriorityLogRepository extends JpaRepository<PriorityLog, Long> {
    List<PriorityLog> findBySosId(Long sosId);
}
