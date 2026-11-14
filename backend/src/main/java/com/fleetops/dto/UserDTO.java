package com.fleetops.dto;

import com.fleetops.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    private String profilePicture;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
