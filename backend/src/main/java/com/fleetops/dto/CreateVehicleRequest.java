package com.fleetops.dto;

import com.fleetops.model.FuelType;
import com.fleetops.model.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateVehicleRequest {
    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Manufacturer is required")
    private String manufacturer;

    @NotBlank(message = "Model is required")
    private String model;

    private VehicleType type;

    @Positive(message = "Max weight must be greater than zero")
    private double maxWeightKg;

    @Positive(message = "Max volume must be greater than zero")
    private double maxVolumeM3;

    private FuelType fuelType;
    private double fuelTankCapacityL;
    private int year;
    private String color;
    private String driverId;
    private String maintenanceDue;
    private String lastMaintenance;
}
