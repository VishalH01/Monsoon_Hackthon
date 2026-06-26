package com.example.demo.service;

import com.example.demo.entity.SOS;
import com.example.demo.entity.SOSStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SOSService {
    SOS createSOS(String victimUsername, Double latitude, Double longitude, String description, MultipartFile image,
                  Integer age, Integer severity, Boolean hasChildren, Boolean isMedicalEmergency, Boolean isDisabled);
    List<SOS> getAllSOS();
    List<SOS> getSOSByStatus(SOSStatus status);
    SOS getSOSById(Long id);
    
    // Admin features
    SOS assignVolunteer(Long id, Long volunteerId);
    SOS updateStatus(Long id, SOSStatus status);
    
    // Volunteer features
    SOS acceptMission(Long id, String volunteerUsername);
    SOS completeMission(Long id, String volunteerUsername);
    List<SOS> getMissionsForVolunteer(String volunteerUsername);
}
