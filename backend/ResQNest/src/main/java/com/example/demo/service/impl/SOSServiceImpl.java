package com.example.demo.service.impl;

import com.example.demo.entity.Role;
import com.example.demo.entity.SOS;
import com.example.demo.entity.SOSPriority;
import com.example.demo.entity.SOSStatus;
import com.example.demo.entity.User;
import com.example.demo.repository.SOSRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.dto.SOSResponse;
import com.example.demo.service.FileStorageService;
import com.example.demo.service.PriorityCalculationService;
import com.example.demo.service.SOSService;
import com.example.demo.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SOSServiceImpl implements SOSService {

    private final SOSRepository sosRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PriorityCalculationService priorityCalculationService;
    private final WebSocketService webSocketService;

    @Override
    @Transactional
    public SOS createSOS(String victimUsername, Double latitude, Double longitude, String description, MultipartFile image,
                          Integer age, Integer severity, Boolean hasChildren, Boolean isMedicalEmergency, Boolean isDisabled) {
        User victim = null;
        if (victimUsername != null && !victimUsername.trim().isEmpty()) {
            victim = userRepository.findByUsername(victimUsername)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + victimUsername));
        }

        // Store file if present
        String storedFileName = fileStorageService.storeFile(image);
        String imageUrl = null;
        if (storedFileName != null) {
            imageUrl = "/uploads/" + storedFileName;
        }

        // Calculate base priority score and initial priority
        Double baseScore = priorityCalculationService.calculateBaseScore(age, severity, hasChildren, isMedicalEmergency, isDisabled);
        SOSPriority initialPriority = priorityCalculationService.mapScoreToPriority(baseScore);

        SOS sos = SOS.builder()
                .latitude(latitude)
                .longitude(longitude)
                .description(description)
                .imageUrl(imageUrl)
                .status(SOSStatus.PENDING)
                .victim(victim)
                .age(age)
                .severity(severity)
                .hasChildren(hasChildren)
                .isMedicalEmergency(isMedicalEmergency)
                .isDisabled(isDisabled)
                .basePriorityScore(baseScore)
                .priority(initialPriority)
                .build();

        SOS savedSos = sosRepository.save(sos);
        try {
            SOSResponse response = SOSResponse.fromEntity(savedSos);
            webSocketService.broadcastNewSOS(response);
            webSocketService.broadcastDashboardUpdate();
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket alerts for new SOS id {}", savedSos.getId(), e);
        }
        return savedSos;
    }

    @Override
    public List<SOS> getAllSOS() {
        List<SOS> list = sosRepository.findAll();
        return sortSOSList(list);
    }

    @Override
    public List<SOS> getSOSByStatus(SOSStatus status) {
        List<SOS> list = sosRepository.findByStatus(status);
        return sortSOSList(list);
    }

    @Override
    public SOS getSOSById(Long id) {
        return sosRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Error: SOS alert not found with ID: " + id));
    }

    @Override
    @Transactional
    public SOS assignVolunteer(Long id, Long volunteerId) {
        SOS sos = getSOSById(id);
        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() -> new IllegalArgumentException("Error: User not found with ID: " + volunteerId));

        if (volunteer.getRole() != Role.VOLUNTEER) {
            throw new IllegalArgumentException("Error: Assigned user must have the VOLUNTEER role!");
        }

        sos.setVolunteer(volunteer);
        sos.setStatus(SOSStatus.ASSIGNED);
        SOS savedSos = sosRepository.save(sos);
        try {
            SOSResponse response = SOSResponse.fromEntity(savedSos);
            webSocketService.broadcastVolunteerAccepted(response);
            webSocketService.broadcastDashboardUpdate();
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket alerts for assigned volunteer, SOS id {}", savedSos.getId(), e);
        }
        return savedSos;
    }

    @Override
    @Transactional
    public SOS updateStatus(Long id, SOSStatus status) {
        SOS sos = getSOSById(id);
        sos.setStatus(status);
        SOS savedSos = sosRepository.save(sos);
        try {
            SOSResponse response = SOSResponse.fromEntity(savedSos);
            if (status == SOSStatus.ASSIGNED || status == SOSStatus.ACTIVE) {
                webSocketService.broadcastVolunteerAccepted(response);
            } else if (status == SOSStatus.RESOLVED) {
                webSocketService.broadcastReliefDelivered(response);
            }
            webSocketService.broadcastDashboardUpdate();
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket status update for SOS id {}", savedSos.getId(), e);
        }
        return savedSos;
    }

    @Override
    @Transactional
    public SOS acceptMission(Long id, String volunteerUsername) {
        SOS sos = getSOSById(id);

        if (sos.getVolunteer() == null || !sos.getVolunteer().getUsername().equals(volunteerUsername)) {
            throw new IllegalArgumentException("Error: You are not assigned to this rescue mission!");
        }

        if (sos.getStatus() != SOSStatus.ASSIGNED) {
            throw new IllegalArgumentException("Error: Mission cannot be accepted because its status is " + sos.getStatus());
        }

        sos.setStatus(SOSStatus.ACTIVE);
        SOS savedSos = sosRepository.save(sos);
        try {
            SOSResponse response = SOSResponse.fromEntity(savedSos);
            webSocketService.broadcastVolunteerAccepted(response);
            webSocketService.broadcastDashboardUpdate();
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket alerts for accepted mission, SOS id {}", savedSos.getId(), e);
        }
        return savedSos;
    }

    @Override
    @Transactional
    public SOS completeMission(Long id, String volunteerUsername) {
        SOS sos = getSOSById(id);

        if (sos.getVolunteer() == null || !sos.getVolunteer().getUsername().equals(volunteerUsername)) {
            throw new IllegalArgumentException("Error: You are not assigned to this rescue mission!");
        }

        if (sos.getStatus() != SOSStatus.ACTIVE && sos.getStatus() != SOSStatus.ASSIGNED) {
            throw new IllegalArgumentException("Error: Mission cannot be completed because its status is " + sos.getStatus());
        }

        sos.setStatus(SOSStatus.RESOLVED);
        SOS savedSos = sosRepository.save(sos);
        try {
            SOSResponse response = SOSResponse.fromEntity(savedSos);
            webSocketService.broadcastReliefDelivered(response);
            webSocketService.broadcastDashboardUpdate();
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket alerts for resolved mission, SOS id {}", savedSos.getId(), e);
        }
        return savedSos;
    }

    @Override
    public List<SOS> getMissionsForVolunteer(String volunteerUsername) {
        List<SOS> list = sosRepository.findByVolunteerUsername(volunteerUsername);
        return sortSOSList(list);
    }

    /**
     * Helper to dynamically sort the SOS alerts in memory by their real-time, waiting-time-adjusted priority scores.
     */
    private List<SOS> sortSOSList(List<SOS> list) {
        return list.stream()
                .sorted((a, b) -> {
                    Double scoreA = priorityCalculationService.calculateDynamicScore(a.getBasePriorityScore(), a.getCreatedAt());
                    Double scoreB = priorityCalculationService.calculateDynamicScore(b.getBasePriorityScore(), b.getCreatedAt());
                    return scoreB.compareTo(scoreA); // Descending (highest score first)
                })
                .collect(Collectors.toList());
    }

    /**
     * Background task that runs every minute to dynamically update and escalate priorities based on waiting time.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoUpdatePriorities() {
        log.info("Starting background task: Recalculating dynamic priorities for pending rescue calls...");
        List<SOS> activeAlerts = sosRepository.findAll().stream()
                .filter(sos -> sos.getStatus() == SOSStatus.PENDING || 
                               sos.getStatus() == SOSStatus.ASSIGNED || 
                               sos.getStatus() == SOSStatus.ACTIVE)
                .collect(Collectors.toList());

        int count = 0;
        for (SOS sos : activeAlerts) {
            Double dynamicScore = priorityCalculationService.calculateDynamicScore(sos.getBasePriorityScore(), sos.getCreatedAt());
            SOSPriority newPriority = priorityCalculationService.mapScoreToPriority(dynamicScore);
            
            if (sos.getPriority() != newPriority) {
                log.info("SOS Alert ID {} priority elevated: {} -> {}", sos.getId(), sos.getPriority(), newPriority);
                sos.setPriority(newPriority);
                sosRepository.save(sos);
                count++;
            }
        }
        log.info("Dynamic priority update complete. Elevated {} alerts.", count);
    }
}
