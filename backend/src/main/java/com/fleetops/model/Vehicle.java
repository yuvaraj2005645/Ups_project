package com.fleetops.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
    private String id; // VH-001
    private String registrationNumber; // TN23AB1234
    private String manufacturer;
    private String model;
    private VehicleType type; // MINI_TRUCK, DELIVERY_VAN, PICKUP_TRUCK, HEAVY_TRUCK, CONTAINER_TRUCK
    private double maxWeightKg;
    private double maxVolumeM3;
    private double currentWeightKg;
    private double currentVolumeM3;
    private FuelType fuelType; // DIESEL, PETROL, CNG, ELECTRIC
    private double fuelTankCapacityL;
    private VehicleStatus status; // AVAILABLE, ASSIGNED, IN_TRANSIT, UNDER_MAINTENANCE, INACTIVE
    private String driverId;
    private String maintenanceDue;
    private String lastMaintenance;
    private int year;
    private String color;
}
