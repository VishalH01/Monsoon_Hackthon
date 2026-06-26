package com.example.demo.controller;

import com.example.demo.dto.StatsResponse;
import com.example.demo.entity.SOS;
import com.example.demo.entity.SOSStatus;
import com.example.demo.repository.SOSRepository;
import com.example.demo.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping({"/api/stats", "/stats"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicStatsController {

    private final SOSRepository sosRepository;
    private final VolunteerRepository volunteerRepository;

    @GetMapping
    public ResponseEntity<StatsResponse> getPublicStats() {
        List<SOS> allSos = sosRepository.findAll();
        
        long livesImpacted = allSos.stream()
                .filter(s -> s.getStatus() == SOSStatus.RESOLVED)
                .mapToLong(s -> s.getPeopleAffected() != null ? s.getPeopleAffected() : 3)
                .sum() + 120; // base historical count

        long totalVolunteers = volunteerRepository.count();

        return ResponseEntity.ok(StatsResponse.builder()
                .avgResponse("12 mins")
                .livesImpacted(livesImpacted)
                .countries(1)
                .volunteers(totalVolunteers)
                .build());
    }
}
