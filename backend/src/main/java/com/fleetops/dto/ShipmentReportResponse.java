package com.fleetops.dto;

import com.fleetops.model.Shipment;
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
public class ShipmentReportResponse {
    private long totalShipments;
    private long completedShipments;
    private long pendingShipments;
    private long delayedShipments;
    private double totalWeightKg;
    private double totalVolumeM3;
    private Map<String, Long> statusBreakdown;
    private Map<String, Long> priorityBreakdown;
    private List<Shipment> shipments;
}
