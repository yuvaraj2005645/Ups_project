package com.fleetops.controller;

import com.fleetops.dto.ApiResponse;
import com.fleetops.dto.CreateDeliveryRequest;
import com.fleetops.dto.ProofOfDeliveryRequest;
import com.fleetops.dto.UpdateDeliveryStatusRequest;
import com.fleetops.model.Delivery;
import com.fleetops.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Delivery>>> getAllDeliveries() {
        List<Delivery> deliveries = deliveryService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(deliveries));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Delivery>> getDeliveryById(@PathVariable String id) {
        Delivery delivery = deliveryService.getById(id);
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
            @Valid @RequestBody UpdateDeliveryStatusRequest request
    ) {
        Delivery updated = deliveryService.updateStatus(id, request.getStatus(), request.getRemarks(), request.getFailureReason());
        return ResponseEntity.ok(ApiResponse.ok("Delivery status updated to " + request.getStatus(), updated));
    }

    @PostMapping("/{id}/proof")
    public ResponseEntity<ApiResponse<Delivery>> submitProof(
            @PathVariable String id,
            @Valid @RequestBody ProofOfDeliveryRequest request
    ) {
        Delivery updated = deliveryService.submitProof(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Proof of delivery submitted successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDelivery(@PathVariable String id) {
        deliveryService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Delivery deleted successfully", null));
    }
}
