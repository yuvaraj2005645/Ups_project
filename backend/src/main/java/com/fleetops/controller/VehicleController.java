package com.fleetops.controller;

import com.fleetops.dto.*;
import com.fleetops.model.Vehicle;
import com.fleetops.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(vehicles));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAvailableVehicles() {
        List<Vehicle> available = vehicleService.getAvailableVehicles();
        return ResponseEntity.ok(ApiResponse.ok(available));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Vehicle>> getVehicleById(@PathVariable String id) {
        Vehicle vehicle = vehicleService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(vehicle));
    }

    @GetMapping("/{id}/capacity")
    public ResponseEntity<ApiResponse<VehicleCapacityResponse>> getVehicleCapacity(@PathVariable String id) {
        VehicleCapacityResponse capacity = vehicleService.getCapacity(id);
        return ResponseEntity.ok(ApiResponse.ok(capacity));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Vehicle>> createVehicle(@Valid @RequestBody CreateVehicleRequest request) {
        Vehicle created = vehicleService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Vehicle>> updateVehicle(
            @PathVariable String id,
            @Valid @RequestBody UpdateVehicleRequest request
    ) {
        Vehicle updated = vehicleService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle updated successfully", updated));
    }

    @PostMapping("/allocate")
    public ResponseEntity<ApiResponse<List<VehicleRecommendationResponse>>> allocateVehicle(
            @Valid @RequestBody AllocateVehicleRequest request
    ) {
        List<VehicleRecommendationResponse> recommendations = vehicleService.allocateVehicle(request);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle allocation recommendations generated", recommendations));
    }

    @PostMapping("/confirm-allocation")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Vehicle>> confirmAllocation(@Valid @RequestBody ConfirmAllocationRequest request) {
        Vehicle vehicle = vehicleService.confirmAllocation(request.getVehicleId(), request.getShipmentId());
        return ResponseEntity.ok(ApiResponse.ok("Allocation confirmed for vehicle " + vehicle.getRegistrationNumber(), vehicle));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable String id) {
        vehicleService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle deleted successfully", null));
    }
}
