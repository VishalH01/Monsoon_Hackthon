package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "priority_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriorityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sosId;

    @Enumerated(EnumType.STRING)
    private SOSPriority oldPriority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SOSPriority newPriority;

    @Column(nullable = false)
    private Double score;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
