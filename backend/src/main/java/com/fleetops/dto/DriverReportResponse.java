package com.fleetops.dto;

import com.fleetops.model.Driver;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverReportResponse {
    private long totalDrivers;
    private long availableDrivers;
    private long onDeliveryDrivers;
    private double avgPerformanceRating;
    private int totalDeliveriesLogged;
    private int totalSuccessfulDeliveriesLogged;
    private double overallSuccessRate;
    private List<Driver> drivers;
}
