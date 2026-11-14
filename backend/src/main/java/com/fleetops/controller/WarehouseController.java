package com.fleetops.controller;

import com.fleetops.dto.ApiResponse;
import com.fleetops.dto.CreateWarehouseRequest;
import com.fleetops.dto.UpdateWarehouseRequest;
import com.fleetops.model.Warehouse;
import com.fleetops.service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Warehouse>>> getAllWarehouses() {
        List<Warehouse> warehouses = warehouseService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(warehouses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Warehouse>> getWarehouseById(@PathVariable String id) {
        Warehouse warehouse = warehouseService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(warehouse));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Warehouse>> createWarehouse(@Valid @RequestBody CreateWarehouseRequest request) {
        Warehouse created = warehouseService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Warehouse created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Warehouse>> updateWarehouse(
            @PathVariable String id,
            @Valid @RequestBody UpdateWarehouseRequest request
    ) {
        Warehouse updated = warehouseService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Warehouse updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(@PathVariable String id) {
        warehouseService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Warehouse deleted successfully", null));
    }
}
