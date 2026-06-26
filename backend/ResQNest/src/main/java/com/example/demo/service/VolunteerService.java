package com.example.demo.service;

import com.example.demo.dto.VolunteerRequest;
import com.example.demo.dto.VolunteerResponse;
import java.util.List;

public interface VolunteerService {
    VolunteerResponse createVolunteer(VolunteerRequest request);
    VolunteerResponse getVolunteerById(Long id);
    List<VolunteerResponse> getAllVolunteers(String status, String skill);
    VolunteerResponse updateVolunteer(Long id, VolunteerRequest request);
    VolunteerResponse updateStatus(Long id, String status);
    void deleteVolunteer(Long id);
}
