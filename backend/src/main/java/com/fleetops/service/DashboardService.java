package com.fleetops.service;

import com.fleetops.dto.DashboardOverviewResponse;
import com.fleetops.model.*;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InMemoryDataStore dataStore;

    public DashboardOverviewResponse getOverview() {
        List<Shipment> shipments = dataStore.findAllShipments();
        List<Vehicle> vehicles = dataStore.findAllVehicles();
        List<Driver> drivers = dataStore.findAllDrivers();
        List<Route> routes = dataStore.findAllRoutes();
        List<Delivery> deliveries = dataStore.findAllDeliveries();

        long totalShipments = shipments.size();
        long activeShipments = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.IN_TRANSIT ||
                             s.getStatus() == ShipmentStatus.OUT_FOR_DELIVERY ||
                             s.getStatus() == ShipmentStatus.ASSIGNED)
                .count();
        long deliveredShipments = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.DELIVERED)
                .count();
        long delayedShipments = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.DELAYED)
                .count();

        long totalVehicles = vehicles.size();
        long availableVehicles = vehicles.stream()
                .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE)
                .count();
        long vehiclesUnderMaintenance = vehicles.stream()
                .filter(v -> v.getStatus() == VehicleStatus.UNDER_MAINTENANCE)
                .count();

        long totalDrivers = drivers.size();
        long availableDrivers = drivers.stream()
                .filter(d -> d.getStatus() == DriverStatus.AVAILABLE)
                .count();

        long activeRoutes = routes.stream()
                .filter(r -> r.getStatus() == RouteStatus.ACTIVE)
                .count();
        long completedRoutes = routes.stream()
                .filter(r -> r.getStatus() == RouteStatus.COMPLETED)
                .count();

        // Calculate average vehicle utilization
        double avgUtil = 0.0;
        List<Vehicle> activeVehicles = vehicles.stream()
                .filter(v -> v.getStatus() == VehicleStatus.ASSIGNED || v.getStatus() == VehicleStatus.IN_TRANSIT || v.getStatus() == VehicleStatus.AVAILABLE)
                .toList();
        if (!activeVehicles.isEmpty()) {
            double sumUtil = activeVehicles.stream()
                    .mapToDouble(v -> (v.getMaxWeightKg() > 0 ? (v.getCurrentWeightKg() / v.getMaxWeightKg() * 100.0) : 0))
                    .sum();
            avgUtil = Math.round((sumUtil / activeVehicles.size()) * 100.0) / 100.0;
        }

        // Recent 5 shipments
        List<Shipment> recentShipments = shipments.stream()
                .sorted(Comparator.comparing(Shipment::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .collect(Collectors.toList());

        // Recent 5 deliveries
        List<Delivery> recentDeliveries = deliveries.stream()
                .sorted(Comparator.comparing(Delivery::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .collect(Collectors.toList());

        // Delayed alerts
        List<Shipment> delayedAlerts = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.DELAYED)
                .collect(Collectors.toList());

        // Vehicles needing maintenance
        List<Vehicle> vehiclesNeedingMaintenance = vehicles.stream()
                .filter(v -> v.getStatus() == VehicleStatus.UNDER_MAINTENANCE ||
                             (v.getMaintenanceDue() != null && !v.getMaintenanceDue().isBlank()))
                .collect(Collectors.toList());

        // Shipment status distribution
        Map<String, Long> statusDistribution = new LinkedHashMap<>();
        for (ShipmentStatus status : ShipmentStatus.values()) {
            long count = shipments.stream().filter(s -> s.getStatus() == status).count();
            if (count > 0) {
                statusDistribution.put(status.name(), count);
            }
        }

        // Vehicle utilization data list
        List<Map<String, Object>> vehicleUtilData = vehicles.stream()
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("vehicleId", v.getId());
                    map.put("registrationNumber", v.getRegistrationNumber());
                    map.put("model", v.getManufacturer() + " " + v.getModel());
                    map.put("type", v.getType() != null ? v.getType().name() : "");
                    double util = v.getMaxWeightKg() > 0 ? Math.round((v.getCurrentWeightKg() / v.getMaxWeightKg() * 100.0) * 10.0) / 10.0 : 0.0;
                    map.put("utilizationPct", util);
                    map.put("status", v.getStatus() != null ? v.getStatus().name() : "");
                    return map;
                })
                .collect(Collectors.toList());

        // Monthly deliveries data (last 6 months)
        List<Map<String, Object>> monthlyDeliveries = new ArrayList<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter monthYearFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            String monthName = monthDate.format(monthYearFormatter);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("month", monthName);
            // Dynamic count simulation based on delivered count
            long deliveredCount = Math.max(12, Math.round(deliveredShipments * (0.6 + (5 - i) * 0.1)));
            item.put("deliveries", deliveredCount);
            item.put("onTime", Math.round(deliveredCount * 0.92));
            monthlyDeliveries.add(item);
        }

        return DashboardOverviewResponse.builder()
                .totalShipments(totalShipments)
                .activeShipments(activeShipments)
                .deliveredShipments(deliveredShipments)
                .delayedShipments(delayedShipments)
                .totalVehicles(totalVehicles)
                .availableVehicles(availableVehicles)
                .vehiclesUnderMaintenance(vehiclesUnderMaintenance)
                .totalDrivers(totalDrivers)
                .availableDrivers(availableDrivers)
                .activeRoutes(activeRoutes)
                .completedRoutes(completedRoutes)
                .avgVehicleUtilization(avgUtil)
                .recentShipments(recentShipments)
                .recentDeliveries(recentDeliveries)
                .delayedAlerts(delayedAlerts)
                .vehiclesNeedingMaintenance(vehiclesNeedingMaintenance)
                .monthlyDeliveriesData(monthlyDeliveries)
                .shipmentStatusDistribution(statusDistribution)
                .vehicleUtilizationData(vehicleUtilData)
                .build();
    }
}
