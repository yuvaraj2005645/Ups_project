package com.fleetops.controller;

import com.fleetops.dto.ApiResponse;
import com.fleetops.dto.CreateDriverRequest;
import com.fleetops.dto.UpdateDriverRequest;
import com.fleetops.dto.UpdateMyProfileRequest;
import com.fleetops.model.Driver;
import com.fleetops.model.Shipment;
import com.fleetops.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Driver>>> getAllDrivers() {
        List<Driver> drivers = driverService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(drivers));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Driver>>> getAvailableDrivers() {
        List<Driver> available = driverService.getAvailable();
        return ResponseEntity.ok(ApiResponse.ok(available));
    }

    // Driver self-service: get own profile by authenticated email
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Driver>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        Driver driver = driverService.findByEmail(userDetails.getUsername());
        if (driver == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("Driver profile not found for this account"));
        }
        return ResponseEntity.ok(ApiResponse.ok(driver));
    }

    // Driver self-service: update own phone/address/city
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<Driver>> updateMyProfile(
            @Valid @RequestBody UpdateMyProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        Driver driver = driverService.findByEmail(userDetails.getUsername());
        if (driver == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("Driver profile not found for this account"));
        }
        Driver updated = driverService.updateMyProfile(driver.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Driver>> getDriverById(@PathVariable String id) {
        Driver driver = driverService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(driver));
    }

    @GetMapping("/{id}/shipments")
    public ResponseEntity<ApiResponse<List<Shipment>>> getDriverShipments(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (isDriver(userDetails)) {
            Driver ownDriver = driverService.findByEmail(userDetails.getUsername());
            if (ownDriver == null || !ownDriver.getId().equalsIgnoreCase(id)) {
                throw new AccessDeniedException("Drivers can only view their own shipments");
            }
        }
        List<Shipment> shipments = driverService.getDriverShipments(id);
        return ResponseEntity.ok(ApiResponse.ok(shipments));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Driver>> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        Driver created = driverService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Driver registered successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Driver>> updateDriver(
            @PathVariable String id,
            @Valid @RequestBody UpdateDriverRequest request
    ) {
        Driver updated = driverService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Driver updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDriver(@PathVariable String id) {
        driverService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Driver deleted successfully", null));
    }

    private boolean isDriver(UserDetails userDetails) {
        return userDetails != null && userDetails.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_DRIVER".equals(authority.getAuthority()));
    }
}
