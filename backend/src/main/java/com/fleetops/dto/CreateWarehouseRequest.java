package com.fleetops.dto;

import com.fleetops.model.WarehouseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateWarehouseRequest {
    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;
    private double lat;
    private double lng;
    private String managerName;
    private String phone;

    @Positive(message = "Total capacity must be positive")
    private double totalCapacityM3;
    private double occupiedCapacityM3;
    private WarehouseStatus status;
}
