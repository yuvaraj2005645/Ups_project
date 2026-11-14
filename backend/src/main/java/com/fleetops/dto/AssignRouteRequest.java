package com.fleetops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignRouteRequest {
    @NotBlank(message = "Route ID is required")
    private String routeId;

    @NotBlank(message = "Driver ID is required")
    private String driverId;

    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    @Builder.Default
    private List<String> shipmentIds = new ArrayList<>();
}
