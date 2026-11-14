package com.fleetops.dto;

import com.fleetops.model.Delivery;
import com.fleetops.model.Shipment;
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
public class DashboardOverviewResponse {
    private long totalShipments;
    private long activeShipments;
    private long deliveredShipments;
    private long delayedShipments;

    private long totalVehicles;
    private long availableVehicles;
    private long vehiclesUnderMaintenance;

    private long totalDrivers;
    private long availableDrivers;

    private long activeRoutes;
    private long completedRoutes;

    private double avgVehicleUtilization;

    private List<Shipment> recentShipments;
    private List<Delivery> recentDeliveries;
    private List<Shipment> delayedAlerts;
    private List<Vehicle> vehiclesNeedingMaintenance;

    private List<Map<String, Object>> monthlyDeliveriesData;
    private Map<String, Long> shipmentStatusDistribution;
    private List<Map<String, Object>> vehicleUtilizationData;
}
