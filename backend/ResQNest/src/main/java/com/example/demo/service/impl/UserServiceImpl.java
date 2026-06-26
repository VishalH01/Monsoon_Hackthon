package com.example.demo.service.impl;

import com.example.demo.dto.AdminUserUpdateRequest;
import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.dto.UserProfileResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String currentUsername, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + currentUsername));

        // If username is changing, check if the new username is already taken
        if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Error: Username is already taken!");
        }

        // If email is changing, check if the new email is already taken
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getAvailability() != null) user.setAvailability(request.getAvailability());
        if (request.getEmailAlerts() != null) user.setEmailAlerts(request.getEmailAlerts());
        if (request.getSmsAlerts() != null) user.setSmsAlerts(request.getSmsAlerts());
        if (request.getPushNotifications() != null) user.setPushNotifications(request.getPushNotifications());
        
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        // Verify old password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Error: Current password does not match!");
        }

        // Set and encode new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserProfileResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Error: User not found with ID: " + id));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse adminUpdateUser(Long id, AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Error: User not found with ID: " + id));

        // Check if username is taken by another user
        if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Error: Username is already taken!");
        }

        // Check if email is taken by another user
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Error: User not found with ID: " + id));
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserProfileResponse checkIn(String username, String safetyStatus) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found with username: " + username));
        user.setSafetyStatus(safetyStatus != null ? safetyStatus : "SAFE");
        user.setSafetyStatusVerified(true);
        user.setLastCheckIn(java.time.LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .location(user.getLocation())
                .skills(user.getSkills())
                .availability(user.getAvailability())
                .acceptTerms(user.getAcceptTerms())
                .emailAlerts(user.getEmailAlerts())
                .smsAlerts(user.getSmsAlerts())
                .pushNotifications(user.getPushNotifications())
                .safetyStatus(user.getSafetyStatus())
                .safetyStatusVerified(user.getSafetyStatusVerified())
                .lastCheckIn(user.getLastCheckIn())
                .assignedShelterId(user.getAssignedShelterId())
                .room(user.getRoom())
                .entryDate(user.getEntryDate())
                .specialNeeds(user.getSpecialNeeds())
                .build();
    }
}
