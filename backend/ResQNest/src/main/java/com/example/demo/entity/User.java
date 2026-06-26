package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Extended profile fields
    private String fullName;
    private String phone;
    private String location;
    private String skills; // Comma-separated
    private String availability;
    private Boolean acceptTerms;

    // Notification preferences
    @Builder.Default
    private Boolean emailAlerts = true;
    @Builder.Default
    private Boolean smsAlerts = false;
    @Builder.Default
    private Boolean pushNotifications = true;

    // Safety check-in info
    @Builder.Default
    private String safetyStatus = "UNKNOWN";
    @Builder.Default
    private Boolean safetyStatusVerified = false;
    private LocalDateTime lastCheckIn;

    // Shelter Resident info
    private Long assignedShelterId;
    private String room;
    private LocalDateTime entryDate;
    private String specialNeeds;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
