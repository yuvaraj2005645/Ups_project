package com.fleetops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDeliveryRequest {
    @NotBlank(message = "Shipment ID is required")
    private String shipmentId;

    private String driverId;
    private String vehicleId;
    private String routeId;
    private String destinationAddress;
    private String destinationCity;
    private LocalDate scheduledDate;
    private String receiverName;
    private String remarks;
}
