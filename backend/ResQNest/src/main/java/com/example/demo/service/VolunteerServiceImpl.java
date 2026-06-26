package com.example.demo.service;

import com.example.demo.dto.VolunteerRequest;
import com.example.demo.dto.VolunteerResponse;
import com.example.demo.entity.Volunteer;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.VolunteerMapper;
import com.example.demo.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VolunteerServiceImpl implements VolunteerService {

    private final VolunteerRepository volunteerRepository;
    private final VolunteerMapper volunteerMapper;

    @Override
    @Transactional
    public VolunteerResponse createVolunteer(VolunteerRequest request) {
        if (volunteerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Volunteer with email already exists: " + request.getEmail());
        }
        Volunteer volunteer = volunteerMapper.toEntity(request);
        Volunteer savedVolunteer = volunteerRepository.save(volunteer);
        return volunteerMapper.toResponse(savedVolunteer);
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerResponse getVolunteerById(Long id) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + id));
        return volunteerMapper.toResponse(volunteer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerResponse> getAllVolunteers(String status, String skill) {
        List<Volunteer> volunteers;
        if (status != null && !status.trim().isEmpty()) {
            volunteers = volunteerRepository.findByStatus(status);
        } else if (skill != null && !skill.trim().isEmpty()) {
            volunteers = volunteerRepository.findBySkillsContainingIgnoreCase(skill);
        } else {
            volunteers = volunteerRepository.findAll();
        }
        return volunteers.stream()
                .map(volunteerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VolunteerResponse updateVolunteer(Long id, VolunteerRequest request) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + id));
        
        // If changing email, check if it's already in use
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(volunteer.getEmail())) {
            if (volunteerRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Volunteer with email already exists: " + request.getEmail());
            }
        }
        
        volunteerMapper.updateEntityFromRequest(request, volunteer);
        Volunteer updatedVolunteer = volunteerRepository.save(volunteer);
        return volunteerMapper.toResponse(updatedVolunteer);
    }

    @Override
    @Transactional
    public VolunteerResponse updateStatus(Long id, String status) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + id));
        
        if (!status.equals("AVAILABLE") && !status.equals("BUSY") && !status.equals("UNAVAILABLE")) {
            throw new IllegalArgumentException("Invalid status. Must be AVAILABLE, BUSY, or UNAVAILABLE");
        }
        
        volunteer.setStatus(status);
        Volunteer updatedVolunteer = volunteerRepository.save(volunteer);
        return volunteerMapper.toResponse(updatedVolunteer);
    }

    @Override
    @Transactional
    public void deleteVolunteer(Long id) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + id));
        volunteerRepository.delete(volunteer);
    }
}
