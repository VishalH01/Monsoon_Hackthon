package com.example.demo.service;

import com.example.demo.entity.SOSPriority;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class PriorityCalculationService {

    public Double calculateBaseScore(Integer age, Integer severity, Boolean hasChildren, 
                                     Boolean isMedicalEmergency, Boolean isDisabled) {
        double score = 0.0;

        // 1. Severity points (input scale 1 to 5, mapped to 20 to 100 points)
        int cleanSeverity = (severity != null) ? Math.max(1, Math.min(5, severity)) : 1;
        score += cleanSeverity * 20.0;

        // 2. Medical Emergency (+30 points)
        if (Boolean.TRUE.equals(isMedicalEmergency)) {
            score += 30.0;
        }

        // 3. Disabled (+25 points)
        if (Boolean.TRUE.equals(isDisabled)) {
            score += 25.0;
        }

        // 4. Children present (+20 points)
        if (Boolean.TRUE.equals(hasChildren)) {
            score += 20.0;
        }

        // 5. Age factor (+15 points if child or elderly)
        if (age != null && (age < 12 || age > 65)) {
            score += 15.0;
        }

        return score;
    }

    public Double calculateDynamicScore(Double baseScore, LocalDateTime createdAt) {
        if (baseScore == null) return 0.0;
        if (createdAt == null) return baseScore;

        long minutesWaiting = Duration.between(createdAt, LocalDateTime.now()).toMinutes();
        // Starvation prevention: add 0.5 points for every minute waiting
        return baseScore + (minutesWaiting * 0.5);
    }

    public SOSPriority mapScoreToPriority(Double score) {
        if (score == null) return SOSPriority.LOW;
        if (score >= 80.0) {
            return SOSPriority.HIGH;
        } else if (score >= 45.0) {
            return SOSPriority.MEDIUM;
        } else {
            return SOSPriority.LOW;
        }
    }
}
