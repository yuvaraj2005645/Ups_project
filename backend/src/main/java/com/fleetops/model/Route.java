package com.fleetops.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route {
    private String id; // RT-001
    private String name;
    private String warehouseId;
    private String originName;
    @Builder.Default
    private List<RouteStop> stops = new ArrayList<>();
    private double totalDistanceKm;
    private int estimatedDurationMin;
    private RouteStatus status; // PLANNED, ACTIVE, COMPLETED, CANCELLED
    private String driverId;
    private String vehicleId;
    @Builder.Default
    private List<String> shipmentIds = new ArrayList<>();
    private LocalDate scheduledDate;
    private LocalDateTime createdAt;
    private boolean optimized;
    private double originalDistanceKm;
}
