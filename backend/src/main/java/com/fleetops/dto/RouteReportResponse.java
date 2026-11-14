package com.fleetops.dto;

import com.fleetops.model.Route;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteReportResponse {
    private long totalRoutes;
    private long activeRoutes;
    private long completedRoutes;
    private double totalDistanceKm;
    private double totalDistanceSavedKm;
    private double avgOptimizationImprovement;
    private List<Route> routes;
}
