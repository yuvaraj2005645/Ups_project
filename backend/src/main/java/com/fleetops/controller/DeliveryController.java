package com.fleetops.controller;

import com.fleetops.dto.ApiResponse;
import com.fleetops.dto.CreateDeliveryRequest;
import com.fleetops.dto.ProofOfDeliveryRequest;
import com.fleetops.dto.UpdateDeliveryStatusRequest;
import com.fleetops.model.Delivery;
import com.fleetops.model.Driver;
import com.fleetops.service.DriverService;
import com.fleetops.service.DeliveryService;
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
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Delivery>>> getAllDeliveries(
            @RequestParam(required = false) String driverId,
            @RequestParam(required = false) String shipmentId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (isDriver(userDetails)) {
            String ownDriverId = requireDriver(userDetails).getId();
            if (driverId != null && !ownDriverId.equalsIgnoreCase(driverId)) {
                throw new AccessDeniedException("Drivers can only view their own deliveries");
            }
            driverId = ownDriverId;
        }
        List<Delivery> deliveries = deliveryService.getAll(driverId, shipmentId);
        return ResponseEntity.ok(ApiResponse.ok(deliveries));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Delivery>> getDeliveryById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Delivery delivery = deliveryService.getById(id);
        assertDriverOwnsDelivery(userDetails, delivery);
        return ResponseEntity.ok(ApiResponse.ok(delivery));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Delivery>> createDelivery(@Valid @RequestBody CreateDeliveryRequest request) {
        Delivery created = deliveryService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Delivery created successfully", created));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Delivery>> updateDeliveryStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateDeliveryStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Delivery delivery = deliveryService.getById(id);
        assertDriverOwnsDelivery(userDetails, delivery);
        Delivery updated = deliveryService.updateStatus(id, request.getStatus(), request.getRemarks(), request.getFailureReason());
        return ResponseEntity.ok(ApiResponse.ok("Delivery status updated to " + request.getStatus(), updated));
    }

    @PostMapping("/{id}/proof")
    public ResponseEntity<ApiResponse<Delivery>> submitProof(
            @PathVariable String id,
            @Valid @RequestBody ProofOfDeliveryRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Delivery delivery = deliveryService.getById(id);
        assertDriverOwnsDelivery(userDetails, delivery);
        Delivery updated = deliveryService.submitProof(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Proof of delivery submitted successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDelivery(@PathVariable String id) {
        deliveryService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Delivery deleted successfully", null));
    }

    private void assertDriverOwnsDelivery(UserDetails userDetails, Delivery delivery) {
        if (isDriver(userDetails)
                && !requireDriver(userDetails).getId().equalsIgnoreCase(delivery.getDriverId())) {
            throw new AccessDeniedException("Drivers can only access their own deliveries");
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
