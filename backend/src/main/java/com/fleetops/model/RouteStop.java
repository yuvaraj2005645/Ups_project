package com.fleetops.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteStop {
    private int sequence;
    private String address;
    private String city;
    private double lat;
    private double lng;
    private String shipmentId;
    private String estimatedArrival;
    private StopStatus status; // PENDING, ARRIVED, COMPLETED, SKIPPED
    private String notes;
}
