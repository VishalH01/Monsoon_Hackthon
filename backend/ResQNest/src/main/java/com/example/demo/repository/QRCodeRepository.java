package com.example.demo.repository;

import com.example.demo.entity.QRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QRCodeRepository extends JpaRepository<QRCode, Long> {
    Optional<QRCode> findBySosId(Long sosId);
    Optional<QRCode> findBySosIdAndToken(Long sosId, String token);
    void deleteBySosId(Long sosId);
}
