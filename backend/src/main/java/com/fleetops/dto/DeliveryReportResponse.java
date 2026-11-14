package com.fleetops.dto;

import com.fleetops.model.Delivery;
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
public class DeliveryReportResponse {
    private long totalDeliveries;
    private long successfulDeliveries;
    private long failedDeliveries;
    private long pendingDeliveries;
    private double successRate;
    private Map<String, Long> statusBreakdown;
    private List<Delivery> deliveries;
}
