package com.fleetops.dto;

import com.fleetops.model.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShipmentStatusRequest {
    @NotNull(message = "Status is required")
    private ShipmentStatus status;
    private String remarks;
}
