package com.fleetops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRouteRequest {
    @NotBlank(message = "Route name is required")
    private String name;

    private String warehouseId;
    private String originName;

    @Builder.Default
    private List<StopRequest> stops = new ArrayList<>();

    private LocalDate scheduledDate;
    private String driverId;
    private String vehicleId;

    @Builder.Default
    private List<String> shipmentIds = new ArrayList<>();
}
