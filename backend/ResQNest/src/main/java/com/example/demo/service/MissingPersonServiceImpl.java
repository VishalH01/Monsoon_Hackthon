package com.example.demo.service;

import com.example.demo.dto.MissingPersonRequest;
import com.example.demo.dto.MissingPersonResponse;
import com.example.demo.entity.MissingPerson;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.MissingPersonMapper;
import com.example.demo.repository.MissingPersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MissingPersonServiceImpl implements MissingPersonService {

    private final MissingPersonRepository missingPersonRepository;
    private final MissingPersonMapper missingPersonMapper;

    @Override
    @Transactional
    public MissingPersonResponse createMissingPerson(MissingPersonRequest request) {
        MissingPerson missingPerson = missingPersonMapper.toEntity(request);
        MissingPerson savedPerson = missingPersonRepository.save(missingPerson);
        return missingPersonMapper.toResponse(savedPerson);
    }

    @Override
    @Transactional(readOnly = true)
    public MissingPersonResponse getMissingPersonById(Long id) {
        MissingPerson missingPerson = missingPersonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Missing person record not found with id: " + id));
        return missingPersonMapper.toResponse(missingPerson);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MissingPersonResponse> getAllMissingPersons(String status, String name, String location) {
        List<MissingPerson> missingPersons;
        if (status != null && !status.trim().isEmpty()) {
            missingPersons = missingPersonRepository.findByStatus(status);
        } else if (name != null && !name.trim().isEmpty()) {
            missingPersons = missingPersonRepository.findByFullNameContainingIgnoreCase(name);
        } else if (location != null && !location.trim().isEmpty()) {
            missingPersons = missingPersonRepository.findByLastSeenLocationContainingIgnoreCase(location);
        } else {
            missingPersons = missingPersonRepository.findAll();
        }
        return missingPersons.stream()
                .map(missingPersonMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MissingPersonResponse updateMissingPerson(Long id, MissingPersonRequest request) {
        MissingPerson missingPerson = missingPersonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Missing person record not found with id: " + id));
        
        missingPersonMapper.updateEntityFromRequest(request, missingPerson);
        MissingPerson updatedPerson = missingPersonRepository.save(missingPerson);
        return missingPersonMapper.toResponse(updatedPerson);
    }

    @Override
    @Transactional
    public MissingPersonResponse updateStatus(Long id, String status) {
        MissingPerson missingPerson = missingPersonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Missing person record not found with id: " + id));
        
        if (!status.equals("MISSING") && !status.equals("FOUND") && !status.equals("REUNITED")) {
            throw new IllegalArgumentException("Invalid status. Must be MISSING, FOUND, or REUNITED");
        }
        
        missingPerson.setStatus(status);
        MissingPerson updatedPerson = missingPersonRepository.save(missingPerson);
        return missingPersonMapper.toResponse(updatedPerson);
    }

    @Override
    @Transactional
    public void deleteMissingPerson(Long id) {
        MissingPerson missingPerson = missingPersonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Missing person record not found with id: " + id));
        missingPersonRepository.delete(missingPerson);
    }
}
