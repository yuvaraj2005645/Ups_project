package com.fleetops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignShipmentRequest {
    @NotBlank(message = "Driver ID is required")
    private String driverId;

    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    private String routeId;
}
