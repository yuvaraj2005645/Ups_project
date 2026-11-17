package com.fleetops.controller;

import com.fleetops.dto.*;
import com.fleetops.model.Route;
import com.fleetops.service.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Route>>> getAllRoutes(
            @RequestParam(required = false) String driverId
    ) {
        List<Route> routes = routeService.getAll(driverId);
        return ResponseEntity.ok(ApiResponse.ok(routes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Route>> getRouteById(@PathVariable String id) {
        Route route = routeService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(route));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Route>> createRoute(@Valid @RequestBody CreateRouteRequest request) {
        Route created = routeService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Route created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Route>> updateRoute(
            @PathVariable String id,
            @Valid @RequestBody UpdateRouteRequest request
    ) {
        Route updated = routeService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Route updated successfully", updated));
    }

    @PostMapping("/optimize")
    public ResponseEntity<ApiResponse<RouteOptimizationResponse>> optimizeRoute(
            @Valid @RequestBody OptimizeRouteRequest request
    ) {
        RouteOptimizationResponse response = routeService.optimize(request);
        return ResponseEntity.ok(ApiResponse.ok("Route optimized successfully", response));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Route>> assignRoute(@Valid @RequestBody AssignRouteRequest request) {
        Route route = routeService.assign(request);
        return ResponseEntity.ok(ApiResponse.ok("Route assigned successfully", route));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable String id) {
        routeService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Route deleted successfully", null));
    }
}
