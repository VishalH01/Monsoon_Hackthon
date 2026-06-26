package com.example.demo.service.impl;

import com.example.demo.entity.Role;
import com.example.demo.entity.SOS;
import com.example.demo.entity.SOSStatus;
import com.example.demo.entity.User;
import com.example.demo.repository.SOSRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.FileStorageService;
import com.example.demo.service.SOSService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SOSServiceImpl implements SOSService {

    private final SOSRepository sosRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public SOS createSOS(String victimUsername, Double latitude, Double longitude, String description, MultipartFile image) {
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

        SOS sos = SOS.builder()
                .latitude(latitude)
                .longitude(longitude)
                .description(description)
                .imageUrl(imageUrl)
                .status(SOSStatus.PENDING)
                .victim(victim)
                .build();

        return sosRepository.save(sos);
    }

    @Override
    public List<SOS> getAllSOS() {
        return sosRepository.findAll();
    }

    @Override
    public List<SOS> getSOSByStatus(SOSStatus status) {
        return sosRepository.findByStatus(status);
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
        return sosRepository.save(sos);
    }

    @Override
    @Transactional
    public SOS updateStatus(Long id, SOSStatus status) {
        SOS sos = getSOSById(id);
        sos.setStatus(status);
        return sosRepository.save(sos);
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
        return sosRepository.save(sos);
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
        return sosRepository.save(sos);
    }

    @Override
    public List<SOS> getMissionsForVolunteer(String volunteerUsername) {
        return sosRepository.findByVolunteerUsername(volunteerUsername);
    }
}
