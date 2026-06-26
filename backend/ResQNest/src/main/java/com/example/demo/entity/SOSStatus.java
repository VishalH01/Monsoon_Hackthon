package com.example.demo.entity;

public enum SOSStatus {
    PENDING,    // Created by victim, awaiting assignment
    ASSIGNED,   // Admin assigned a volunteer, awaiting volunteer acceptance
    ACTIVE,     // Volunteer accepted the mission
    RESOLVED    // Mission successfully completed
}
