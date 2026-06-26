package com.example.demo.service;

import com.example.demo.dto.MissingPersonRequest;
import com.example.demo.dto.MissingPersonResponse;
import java.util.List;

public interface MissingPersonService {
    MissingPersonResponse createMissingPerson(MissingPersonRequest request);
    MissingPersonResponse getMissingPersonById(Long id);
    List<MissingPersonResponse> getAllMissingPersons(String status, String name, String location);
    MissingPersonResponse updateMissingPerson(Long id, MissingPersonRequest request);
    MissingPersonResponse updateStatus(Long id, String status);
    void deleteMissingPerson(Long id);
}
