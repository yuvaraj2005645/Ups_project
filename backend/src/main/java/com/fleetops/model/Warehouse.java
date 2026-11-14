package com.fleetops.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {
    private String id; // WH-001
    private String name;
    private String address;
    private String city;
    private String state;
    private double lat;
    private double lng;
    private String managerName;
    private String phone;
    private double totalCapacityM3;
    private double occupiedCapacityM3;
    private WarehouseStatus status; // ACTIVE, INACTIVE, MAINTENANCE
    private LocalDateTime createdAt;
}
