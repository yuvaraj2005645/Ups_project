package com.fleetops.controller;

import com.fleetops.dto.*;
import com.fleetops.model.Shipment;
import com.fleetops.model.ShipmentHistory;
import com.fleetops.model.ShipmentPriority;
import com.fleetops.model.ShipmentStatus;
import com.fleetops.model.Driver;
import com.fleetops.service.ShipmentService;
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
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Shipment>>> getAllShipments(
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) String driverId,
            @RequestParam(required = false) String vehicleId,
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) ShipmentPriority priority,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (isDriver(userDetails)) {
            String ownDriverId = requireDriver(userDetails).getId();
            if (driverId != null && !ownDriverId.equalsIgnoreCase(driverId)) {
                throw new AccessDeniedException("Drivers can only view their own shipments");
            }
            driverId = ownDriverId;
        }
        List<Shipment> shipments = shipmentService.getAll(status, driverId, vehicleId, customerId, priority);
        return ResponseEntity.ok(ApiResponse.ok(shipments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Shipment>> getShipmentById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Shipment shipment = shipmentService.getById(id);
        assertDriverOwnsShipment(userDetails, shipment);
        return ResponseEntity.ok(ApiResponse.ok(shipment));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Shipment>> createShipment(
            @Valid @RequestBody CreateShipmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String createdBy = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        Shipment created = shipmentService.create(request, createdBy);
        return ResponseEntity.ok(ApiResponse.ok("Shipment created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Shipment>> updateShipment(
            @PathVariable String id,
            @Valid @RequestBody UpdateShipmentRequest request
    ) {
        Shipment updated = shipmentService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Shipment updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Shipment>> updateShipmentStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateShipmentStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Shipment shipment = shipmentService.getById(id);
        assertDriverOwnsShipment(userDetails, shipment);
        String updatedBy = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        Shipment updated = shipmentService.updateStatus(id, request.getStatus(), request.getRemarks(), updatedBy);
        return ResponseEntity.ok(ApiResponse.ok("Shipment status updated to " + request.getStatus(), updated));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<ShipmentHistory>>> getShipmentHistory(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Shipment shipment = shipmentService.getById(id);
        assertDriverOwnsShipment(userDetails, shipment);
        List<ShipmentHistory> history = shipmentService.getHistory(id);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Shipment>> assignShipment(
            @PathVariable String id,
            @Valid @RequestBody AssignShipmentRequest request
    ) {
        Shipment assigned = shipmentService.assign(id, request.getDriverId(), request.getVehicleId(), request.getRouteId());
        return ResponseEntity.ok(ApiResponse.ok("Shipment assigned successfully", assigned));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteShipment(@PathVariable String id) {
        shipmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Shipment deleted successfully", null));
    }

    private void assertDriverOwnsShipment(UserDetails userDetails, Shipment shipment) {
        if (isDriver(userDetails)
                && !requireDriver(userDetails).getId().equalsIgnoreCase(shipment.getDriverId())) {
            throw new AccessDeniedException("Drivers can only access their own shipments");
        }
    }

    private Driver requireDriver(UserDetails userDetails) {
        Driver driver = driverService.findByEmail(userDetails.getUsername());
        if (driver == null) {
            throw new AccessDeniedException("No driver profile is linked to this account");
        }
        return driver;
    }

    private boolean isDriver(UserDetails userDetails) {
        return userDetails != null && userDetails.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_DRIVER".equals(authority.getAuthority()));
    }
}
