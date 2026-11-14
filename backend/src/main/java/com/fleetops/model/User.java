package com.fleetops.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    private String id; // USR-001
    private String name;
    private String email;
    private String password; // BCrypt hashed
    private Role role; // enum: ADMIN, DISPATCHER, DRIVER
    private String phone;
    private String profilePicture;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
