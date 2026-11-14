package com.fleetops.dto;

import com.fleetops.model.WarehouseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateWarehouseRequest {
    private String name;
    private String address;
    private String city;
    private String state;
    private Double lat;
    private Double lng;
    private String managerName;
    private String phone;
    private Double totalCapacityM3;
    private Double occupiedCapacityM3;
    private WarehouseStatus status;
}
