package com.fleetops.controller;

import com.fleetops.dto.ApiResponse;
import com.fleetops.dto.CreateDriverRequest;
import com.fleetops.dto.UpdateDriverRequest;
import com.fleetops.model.Driver;
import com.fleetops.model.Shipment;
import com.fleetops.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Driver>> getDriverById(@PathVariable String id) {
        Driver driver = driverService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(driver));
    }

    @GetMapping("/{id}/shipments")
    public ResponseEntity<ApiResponse<List<Shipment>>> getDriverShipments(@PathVariable String id) {
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
}
