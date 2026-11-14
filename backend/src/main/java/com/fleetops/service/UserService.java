package com.fleetops.service;

import com.fleetops.dto.CreateUserRequest;
import com.fleetops.dto.UpdateUserRequest;
import com.fleetops.dto.UserDTO;
import com.fleetops.exception.BusinessRuleException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.model.Role;
import com.fleetops.model.User;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final InMemoryDataStore dataStore;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getAll() {
        return dataStore.findAllUsers().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getById(String id) {
        User user = dataStore.findUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return toDTO(user);
    }

    public UserDTO create(CreateUserRequest request) {
        if (dataStore.findUserByEmail(request.getEmail()).isPresent()) {
            throw new BusinessRuleException("User with email " + request.getEmail() + " already exists");
        }

        User user = User.builder()
                .id(dataStore.generateUserId())
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.DRIVER)
                .phone(request.getPhone())
                .profilePicture(request.getProfilePicture())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        return toDTO(dataStore.saveUser(user));
    }

    public UserDTO update(String id, UpdateUserRequest request) {
        User user = dataStore.findUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());
        if (request.getActive() != null) user.setActive(request.getActive());

        return toDTO(dataStore.saveUser(user));
    }

    public UserDTO updateRole(String id, Role role) {
        User user = dataStore.findUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setRole(role);
        return toDTO(dataStore.saveUser(user));
    }

    public UserDTO activate(String id) {
        User user = dataStore.findUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setActive(true);
        return toDTO(dataStore.saveUser(user));
    }

    public UserDTO deactivate(String id) {
        User user = dataStore.findUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setActive(false);
        return toDTO(dataStore.saveUser(user));
    }

    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .profilePicture(user.getProfilePicture())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
