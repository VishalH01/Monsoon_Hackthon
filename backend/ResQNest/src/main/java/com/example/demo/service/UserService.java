package com.example.demo.service;

import com.example.demo.dto.AdminUserUpdateRequest;
import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.dto.UserProfileResponse;

import java.util.List;

public interface UserService {
    UserProfileResponse getUserProfile(String username);
    UserProfileResponse updateProfile(String username, UpdateProfileRequest request);
    void changePassword(String username, ChangePasswordRequest request);
    
    // Admin CRUD
    List<UserProfileResponse> getAllUsers();
    UserProfileResponse getUserById(Long id);
    UserProfileResponse adminUpdateUser(Long id, AdminUserUpdateRequest request);
    void deleteUser(Long id);
}
