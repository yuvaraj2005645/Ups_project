package com.fleetops.dto;

import com.fleetops.model.RouteStop;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteOptimizationResponse {
    private List<RouteStop> optimizedStops;
    private double originalDistanceKm;
    private double optimizedDistanceKm;
    private double distanceSavedKm;
    private int timeSavedMin;
    private double improvement;
}
