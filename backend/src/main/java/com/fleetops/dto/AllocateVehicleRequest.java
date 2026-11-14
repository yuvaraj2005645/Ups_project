package com.fleetops.dto;

import com.fleetops.model.ShipmentPriority;
import com.fleetops.model.VehicleType;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocateVehicleRequest {
    private String shipmentId;

    @Positive(message = "Weight must be greater than zero")
    private double weightKg;

    @Positive(message = "Volume must be greater than zero")
    private double volumeM3;

    private ShipmentPriority priority;
    private VehicleType vehicleType; // optional
}
