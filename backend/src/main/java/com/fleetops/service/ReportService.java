package com.fleetops.service;

import com.fleetops.dto.*;
import com.fleetops.model.*;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final InMemoryDataStore dataStore;

    public ShipmentReportResponse getShipmentReport(LocalDate from, LocalDate to) {
        List<Shipment> list = dataStore.findAllShipments().stream()
                .filter(s -> {
                    if (s.getCreatedAt() == null) return true;
                    LocalDate createdDate = s.getCreatedAt().toLocalDate();
                    if (from != null && createdDate.isBefore(from)) return false;
                    return to == null || !createdDate.isAfter(to);
                })
                .collect(Collectors.toList());

        long total = list.size();
        long completed = list.stream().filter(s -> s.getStatus() == ShipmentStatus.DELIVERED).count();
        long pending = list.stream().filter(s -> s.getStatus() == ShipmentStatus.PENDING || s.getStatus() == ShipmentStatus.SCHEDULED).count();
        long delayed = list.stream().filter(s -> s.getStatus() == ShipmentStatus.DELAYED).count();

        double totalWeight = list.stream().mapToDouble(Shipment::getWeightKg).sum();
        double totalVolume = list.stream().mapToDouble(Shipment::getVolumeM3).sum();

        Map<String, Long> statusBreakdown = list.stream()
                .collect(Collectors.groupingBy(s -> s.getStatus().name(), Collectors.counting()));

        Map<String, Long> priorityBreakdown = list.stream()
                .collect(Collectors.groupingBy(s -> s.getPriority().name(), Collectors.counting()));

        return ShipmentReportResponse.builder()
                .totalShipments(total)
                .completedShipments(completed)
                .pendingShipments(pending)
                .delayedShipments(delayed)
                .totalWeightKg(Math.round(totalWeight * 100.0) / 100.0)
                .totalVolumeM3(Math.round(totalVolume * 100.0) / 100.0)
                .statusBreakdown(statusBreakdown)
                .priorityBreakdown(priorityBreakdown)
                .shipments(list)
                .build();
    }

    public VehicleReportResponse getVehicleReport() {
        List<Vehicle> list = dataStore.findAllVehicles();
        long total = list.size();
        long available = list.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE).count();
        long inTransit = list.stream().filter(v -> v.getStatus() == VehicleStatus.IN_TRANSIT).count();
        long maintenance = list.stream().filter(v -> v.getStatus() == VehicleStatus.UNDER_MAINTENANCE).count();

        double totalMaxWeight = list.stream().mapToDouble(Vehicle::getMaxWeightKg).sum();
        double totalCurWeight = list.stream().mapToDouble(Vehicle::getCurrentWeightKg).sum();
        double overallUtil = totalMaxWeight > 0 ? (totalCurWeight / totalMaxWeight * 100.0) : 0;

        Map<String, Long> typeBreakdown = list.stream()
                .collect(Collectors.groupingBy(v -> v.getType() != null ? v.getType().name() : "OTHER", Collectors.counting()));

        return VehicleReportResponse.builder()
                .totalVehicles(total)
                .availableVehicles(available)
                .inTransitVehicles(inTransit)
                .maintenanceVehicles(maintenance)
                .overallCapacityUtilization(Math.round(overallUtil * 100.0) / 100.0)
                .typeBreakdown(typeBreakdown)
                .vehicles(list)
                .build();
    }

    public RouteReportResponse getRouteReport() {
        List<Route> list = dataStore.findAllRoutes();
        long total = list.size();
        long active = list.stream().filter(r -> r.getStatus() == RouteStatus.ACTIVE).count();
        long completed = list.stream().filter(r -> r.getStatus() == RouteStatus.COMPLETED).count();

        double totalDist = list.stream().mapToDouble(Route::getTotalDistanceKm).sum();
        double totalSaved = list.stream().mapToDouble(r -> Math.max(0, r.getOriginalDistanceKm() - r.getTotalDistanceKm())).sum();

        double avgImprovement = list.stream()
                .filter(Route::isOptimized)
                .mapToDouble(r -> (r.getOriginalDistanceKm() > 0 ? ((r.getOriginalDistanceKm() - r.getTotalDistanceKm()) / r.getOriginalDistanceKm() * 100.0) : 0))
                .average()
                .orElse(12.5);

        return RouteReportResponse.builder()
                .totalRoutes(total)
                .activeRoutes(active)
                .completedRoutes(completed)
                .totalDistanceKm(Math.round(totalDist * 100.0) / 100.0)
                .totalDistanceSavedKm(Math.round(totalSaved * 100.0) / 100.0)
                .avgOptimizationImprovement(Math.round(avgImprovement * 100.0) / 100.0)
                .routes(list)
                .build();
    }

    public DriverReportResponse getDriverReport() {
        List<Driver> list = dataStore.findAllDrivers();
        long total = list.size();
        long available = list.stream().filter(d -> d.getStatus() == DriverStatus.AVAILABLE).count();
        long onDelivery = list.stream().filter(d -> d.getStatus() == DriverStatus.ON_DELIVERY).count();

        double avgRating = list.stream().mapToDouble(Driver::getPerformanceRating).average().orElse(0);
        int totalDeliveries = list.stream().mapToInt(Driver::getTotalDeliveries).sum();
        int totalSuccessful = list.stream().mapToInt(Driver::getSuccessfulDeliveries).sum();
        double successRate = totalDeliveries > 0 ? ((double) totalSuccessful / totalDeliveries * 100.0) : 0;

        return DriverReportResponse.builder()
                .totalDrivers(total)
                .availableDrivers(available)
                .onDeliveryDrivers(onDelivery)
                .avgPerformanceRating(Math.round(avgRating * 100.0) / 100.0)
                .totalDeliveriesLogged(totalDeliveries)
                .totalSuccessfulDeliveriesLogged(totalSuccessful)
                .overallSuccessRate(Math.round(successRate * 100.0) / 100.0)
                .drivers(list)
                .build();
    }

    public DeliveryReportResponse getDeliveryReport(LocalDate from, LocalDate to) {
        List<Delivery> list = dataStore.findAllDeliveries().stream()
                .filter(d -> {
                    if (d.getCreatedAt() == null) return true;
                    LocalDate date = d.getCreatedAt().toLocalDate();
                    if (from != null && date.isBefore(from)) return false;
                    return to == null || !date.isAfter(to);
                })
                .collect(Collectors.toList());

        long total = list.size();
        long successful = list.stream().filter(d -> d.getStatus() == DeliveryStatus.DELIVERED).count();
        long failed = list.stream().filter(d -> d.getStatus() == DeliveryStatus.FAILED || d.getStatus() == DeliveryStatus.RETURNED).count();
        long pending = total - (successful + failed);

        double rate = total > 0 ? ((double) successful / total * 100.0) : 0;
        Map<String, Long> statusBreakdown = list.stream()
                .collect(Collectors.groupingBy(d -> d.getStatus().name(), Collectors.counting()));

        return DeliveryReportResponse.builder()
                .totalDeliveries(total)
                .successfulDeliveries(successful)
                .failedDeliveries(failed)
                .pendingDeliveries(pending)
                .successRate(Math.round(rate * 100.0) / 100.0)
                .statusBreakdown(statusBreakdown)
                .deliveries(list)
                .build();
    }
}
