package com.fleetops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleCapacityResponse {
    private String vehicleId;
    private double maxWeightKg;
    private double maxVolumeM3;
    private double currentWeightKg;
    private double currentVolumeM3;
    private double remainingWeightKg;
    private double remainingVolumeM3;
    private double weightUtilizationPct;
    private double volumeUtilizationPct;
}
