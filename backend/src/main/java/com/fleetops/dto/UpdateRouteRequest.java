package com.fleetops.dto;

import com.fleetops.model.RouteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRouteRequest {
    private String name;
    private String warehouseId;
    private String originName;
    private List<StopRequest> stops;
    private RouteStatus status;
    private String driverId;
    private String vehicleId;
    private List<String> shipmentIds;
    private LocalDate scheduledDate;
}
