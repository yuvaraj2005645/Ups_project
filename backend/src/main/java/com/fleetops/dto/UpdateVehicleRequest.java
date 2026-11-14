package com.fleetops.dto;

import com.fleetops.model.FuelType;
import com.fleetops.model.VehicleStatus;
import com.fleetops.model.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateVehicleRequest {
    private String registrationNumber;
    private String manufacturer;
    private String model;
    private VehicleType type;
    private double maxWeightKg;
    private double maxVolumeM3;
    private FuelType fuelType;
    private double fuelTankCapacityL;
    private VehicleStatus status;
    private String driverId;
    private String maintenanceDue;
    private String lastMaintenance;
    private int year;
    private String color;
}
