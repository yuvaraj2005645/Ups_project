package com.fleetops.service;

import com.fleetops.dto.*;
import com.fleetops.exception.BusinessRuleException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.model.*;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final InMemoryDataStore dataStore;
    private final DriverService driverService;
    private final VehicleService vehicleService;

    public List<Route> getAll(String driverId) {
        return dataStore.findAllRoutes().stream()
                .filter(r -> driverId == null || driverId.equals(r.getDriverId()))
                .collect(java.util.stream.Collectors.toList());
    }

    public Route getById(String id) {
        return dataStore.findRouteById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + id));
    }

    public Route create(CreateRouteRequest request) {
        List<RouteStop> stops = new ArrayList<>();
        if (request.getStops() != null) {
            int seq = 1;
            for (StopRequest sr : request.getStops()) {
                stops.add(RouteStop.builder()
                        .sequence(sr.getSequence() > 0 ? sr.getSequence() : seq++)
                        .address(sr.getAddress())
                        .city(sr.getCity())
                        .lat(sr.getLat())
                        .lng(sr.getLng())
                        .shipmentId(sr.getShipmentId())
                        .estimatedArrival(sr.getEstimatedArrival())
                        .status(sr.getStatus() != null ? sr.getStatus() : StopStatus.PENDING)
                        .notes(sr.getNotes())
                        .build());
            }
        }

        // Calculate initial distance
        double totalDist = calculateTotalStopsDistance(stops);
        int estDuration = (int) Math.round((totalDist / 45.0) * 60.0); // 45km/h avg speed

        Route route = Route.builder()
                .id(dataStore.generateRouteId())
                .name(request.getName())
                .warehouseId(request.getWarehouseId())
                .originName(request.getOriginName())
                .stops(stops)
                .totalDistanceKm(Math.round(totalDist * 100.0) / 100.0)
                .originalDistanceKm(Math.round(totalDist * 100.0) / 100.0)
                .estimatedDurationMin(estDuration)
                .status(RouteStatus.PLANNED)
                .driverId(request.getDriverId())
                .vehicleId(request.getVehicleId())
                .shipmentIds(request.getShipmentIds() != null ? request.getShipmentIds() : new ArrayList<>())
                .scheduledDate(request.getScheduledDate())
                .createdAt(LocalDateTime.now())
                .optimized(false)
                .build();

        return dataStore.saveRoute(route);
    }

    public Route update(String id, UpdateRouteRequest request) {
        Route route = getById(id);

        if (request.getName() != null) route.setName(request.getName());
        if (request.getWarehouseId() != null) route.setWarehouseId(request.getWarehouseId());
        if (request.getOriginName() != null) route.setOriginName(request.getOriginName());
        if (request.getStatus() != null) route.setStatus(request.getStatus());
        if (request.getDriverId() != null) route.setDriverId(request.getDriverId());
        if (request.getVehicleId() != null) route.setVehicleId(request.getVehicleId());
        if (request.getShipmentIds() != null) route.setShipmentIds(request.getShipmentIds());
        if (request.getScheduledDate() != null) route.setScheduledDate(request.getScheduledDate());

        if (request.getStops() != null) {
            List<RouteStop> stops = request.getStops().stream()
                    .map(sr -> RouteStop.builder()
                            .sequence(sr.getSequence())
                            .address(sr.getAddress())
                            .city(sr.getCity())
                            .lat(sr.getLat())
                            .lng(sr.getLng())
                            .shipmentId(sr.getShipmentId())
                            .estimatedArrival(sr.getEstimatedArrival())
                            .status(sr.getStatus() != null ? sr.getStatus() : StopStatus.PENDING)
                            .notes(sr.getNotes())
                            .build())
                    .collect(Collectors.toList());
            route.setStops(stops);
            double dist = calculateTotalStopsDistance(stops);
            route.setTotalDistanceKm(Math.round(dist * 100.0) / 100.0);
            route.setEstimatedDurationMin((int) Math.round((dist / 45.0) * 60.0));
        }

        return dataStore.saveRoute(route);
    }

    public void delete(String id) {
        if (!dataStore.deleteRoute(id)) {
            throw new ResourceNotFoundException("Route not found with ID: " + id);
        }
    }

    public RouteOptimizationResponse optimize(OptimizeRouteRequest request) {
        if (request.getStops() == null || request.getStops().isEmpty()) {
            throw new BusinessRuleException("Cannot optimize route with no stops");
        }

        RouteStop origin;
        if (request.getWarehouseId() != null && !request.getWarehouseId().isBlank()) {
            Warehouse wh = dataStore.findWarehouseById(request.getWarehouseId()).orElse(null);
            if (wh != null) {
                origin = RouteStop.builder()
                        .sequence(0)
                        .address(wh.getAddress())
                        .city(wh.getCity())
                        .lat(wh.getLat())
                        .lng(wh.getLng())
                        .notes("Origin Warehouse: " + wh.getName())
                        .build();
            } else {
                StopRequest first = request.getStops().get(0);
                origin = RouteStop.builder()
                        .sequence(0)
                        .address(first.getAddress())
                        .city(first.getCity())
                        .lat(first.getLat())
                        .lng(first.getLng())
                        .build();
            }
        } else {
            StopRequest first = request.getStops().get(0);
            origin = RouteStop.builder()
                    .sequence(0)
                    .address(first.getAddress())
                    .city(first.getCity())
                    .lat(first.getLat())
                    .lng(first.getLng())
                    .build();
        }

        List<RouteStop> inputStops = new ArrayList<>();
        int seq = 1;
        for (StopRequest sr : request.getStops()) {
            inputStops.add(RouteStop.builder()
                    .sequence(seq++)
                    .address(sr.getAddress())
                    .city(sr.getCity())
                    .lat(sr.getLat())
                    .lng(sr.getLng())
                    .shipmentId(sr.getShipmentId())
                    .estimatedArrival(sr.getEstimatedArrival())
                    .status(sr.getStatus() != null ? sr.getStatus() : StopStatus.PENDING)
                    .notes(sr.getNotes())
                    .build());
        }

        double originalDistance = calculateDistanceFromOrigin(origin, inputStops);
        List<RouteStop> optimizedStops = optimizeStops(origin, inputStops);
        double optimizedDistance = calculateDistanceFromOrigin(origin, optimizedStops);

        double distanceSaved = Math.max(0, originalDistance - optimizedDistance);
        int timeSavedMin = (int) Math.round((distanceSaved / 40.0) * 60.0);
        double improvement = (originalDistance > 0) ? ((distanceSaved / originalDistance) * 100.0) : 0;

        return RouteOptimizationResponse.builder()
                .optimizedStops(optimizedStops)
                .originalDistanceKm(Math.round(originalDistance * 100.0) / 100.0)
                .optimizedDistanceKm(Math.round(optimizedDistance * 100.0) / 100.0)
                .distanceSavedKm(Math.round(distanceSaved * 100.0) / 100.0)
                .timeSavedMin(timeSavedMin)
                .improvement(Math.round(improvement * 100.0) / 100.0)
                .build();
    }

    public Route assign(AssignRouteRequest request) {
        Route route = getById(request.getRouteId());
        Driver driver = driverService.getById(request.getDriverId());
        Vehicle vehicle = vehicleService.getById(request.getVehicleId());

        if (driver.getStatus() == DriverStatus.ON_LEAVE || driver.getStatus() == DriverStatus.INACTIVE) {
            throw new BusinessRuleException("Driver is not available for assignment");
        }
        if (vehicle.getStatus() == VehicleStatus.UNDER_MAINTENANCE || vehicle.getStatus() == VehicleStatus.INACTIVE) {
            throw new BusinessRuleException("Vehicle is not available for assignment");
        }

        route.setDriverId(driver.getId());
        route.setVehicleId(vehicle.getId());
        if (request.getShipmentIds() != null && !request.getShipmentIds().isEmpty()) {
            route.setShipmentIds(request.getShipmentIds());
            for (String shId : request.getShipmentIds()) {
                driverService.assign(driver.getId(), shId);
                vehicleService.confirmAllocation(vehicle.getId(), shId);
            }
        }
        route.setStatus(RouteStatus.ACTIVE);

        driver.setStatus(DriverStatus.ON_DELIVERY);
        driver.setVehicleId(vehicle.getId());
        dataStore.saveDriver(driver);

        vehicle.setStatus(VehicleStatus.IN_TRANSIT);
        vehicle.setDriverId(driver.getId());
        dataStore.saveVehicle(vehicle);

        return dataStore.saveRoute(route);
    }

    private List<RouteStop> optimizeStops(RouteStop origin, List<RouteStop> stops) {
        List<RouteStop> remaining = new ArrayList<>(stops);
        List<RouteStop> optimized = new ArrayList<>();
        RouteStop current = origin;
        int seq = 1;
        while (!remaining.isEmpty()) {
            RouteStop nearest = null;
            double minDist = Double.MAX_VALUE;
            for (RouteStop stop : remaining) {
                double dist = calculateDistance(current.getLat(), current.getLng(), stop.getLat(), stop.getLng());
                if (dist < minDist) {
                    minDist = dist;
                    nearest = stop;
                }
            }
            if (nearest == null) break;
            nearest.setSequence(seq++);
            optimized.add(nearest);
            remaining.remove(nearest);
            current = nearest;
        }
        return optimized;
    }

    private double calculateDistanceFromOrigin(RouteStop origin, List<RouteStop> stops) {
        if (stops == null || stops.isEmpty()) return 0;
        double dist = calculateDistance(origin.getLat(), origin.getLng(), stops.get(0).getLat(), stops.get(0).getLng());
        for (int i = 0; i < stops.size() - 1; i++) {
            dist += calculateDistance(stops.get(i).getLat(), stops.get(i).getLng(), stops.get(i + 1).getLat(), stops.get(i + 1).getLng());
        }
        return dist;
    }

    private double calculateTotalStopsDistance(List<RouteStop> stops) {
        if (stops == null || stops.size() < 2) return 0;
        double dist = 0;
        for (int i = 0; i < stops.size() - 1; i++) {
            dist += calculateDistance(stops.get(i).getLat(), stops.get(i).getLng(), stops.get(i + 1).getLat(), stops.get(i + 1).getLng());
        }
        return dist;
    }

    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0; // Earth radius km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
