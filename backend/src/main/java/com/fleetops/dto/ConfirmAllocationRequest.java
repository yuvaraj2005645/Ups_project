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
public class ConfirmAllocationRequest {
    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    @NotBlank(message = "Shipment ID is required")
    private String shipmentId;
}
