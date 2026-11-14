package com.fleetops.dto;

import com.fleetops.model.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleReportResponse {
    private long totalVehicles;
    private long availableVehicles;
    private long inTransitVehicles;
    private long maintenanceVehicles;
    private double overallCapacityUtilization;
    private Map<String, Long> typeBreakdown;
    private List<Vehicle> vehicles;
}
