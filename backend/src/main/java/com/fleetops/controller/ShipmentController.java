package com.fleetops.controller;

import com.fleetops.dto.*;
import com.fleetops.model.Shipment;
import com.fleetops.model.ShipmentHistory;
import com.fleetops.model.ShipmentPriority;
import com.fleetops.model.ShipmentStatus;
import com.fleetops.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public ResponseEntity<ApiResponse<List<Shipment>>> getAllShipments(
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) String driverId,
            @RequestParam(required = false) String vehicleId,
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) ShipmentPriority priority
    ) {
        List<Shipment> shipments = shipmentService.getAll(status, driverId, vehicleId, customerId, priority);
        return ResponseEntity.ok(ApiResponse.ok(shipments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Shipment>> getShipmentById(@PathVariable String id) {
        Shipment shipment = shipmentService.getById(id);
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
        String updatedBy = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        Shipment updated = shipmentService.updateStatus(id, request.getStatus(), request.getRemarks(), updatedBy);
        return ResponseEntity.ok(ApiResponse.ok("Shipment status updated to " + request.getStatus(), updated));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<ShipmentHistory>>> getShipmentHistory(@PathVariable String id) {
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
}
