package com.fleetops.service;

import com.fleetops.dto.LoginRequest;
import com.fleetops.dto.LoginResponse;
import com.fleetops.dto.UserDTO;
import com.fleetops.exception.BusinessRuleException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.model.User;
import com.fleetops.repository.InMemoryDataStore;
import com.fleetops.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final InMemoryDataStore dataStore;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public LoginResponse login(LoginRequest request) {
        User user = dataStore.findUserByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessRuleException("Invalid email or password"));

        if (!user.isActive()) {
            throw new BusinessRuleException("Account is disabled. Please contact administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessRuleException("Invalid email or password");
        }

        user.setLastLogin(LocalDateTime.now());
        dataStore.saveUser(user);

        String token = jwtUtil.generateToken(user);
        return LoginResponse.builder()
                .token(token)
                .user(userService.toDTO(user))
                .build();
    }

    public String forgotPassword(String email) {
        User user = dataStore.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + email));
        // Simulated password reset trigger
        return "Password reset link sent to " + user.getEmail();
    }

    public String resetPassword(String email, String newPassword) {
        User user = dataStore.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        dataStore.saveUser(user);
        return "Password successfully updated";
    }

    public UserDTO getCurrentUser(String email) {
        User user = dataStore.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userService.toDTO(user);
    }
}
