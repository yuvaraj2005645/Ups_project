package com.fleetops.controller;

import com.fleetops.dto.ApiResponse;
import com.fleetops.dto.CreateUserRequest;
import com.fleetops.dto.UpdateRoleRequest;
import com.fleetops.dto.UpdateUserRequest;
import com.fleetops.dto.UserDTO;
import com.fleetops.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable String id) {
        UserDTO user = userService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDTO created = userService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("User created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserDTO updated = userService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully", updated));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> updateRole(
            @PathVariable String id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        UserDTO updated = userService.updateRole(id, request.getRole());
        return ResponseEntity.ok(ApiResponse.ok("User role updated successfully", updated));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> activateUser(@PathVariable String id) {
        UserDTO updated = userService.activate(id);
        return ResponseEntity.ok(ApiResponse.ok("User account activated", updated));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> deactivateUser(@PathVariable String id) {
        UserDTO updated = userService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.ok("User account deactivated", updated));
    }
}
