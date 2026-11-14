package com.fleetops.dto;

import com.fleetops.model.ShipmentPriority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShipmentRequest {
    private String customerId;
    private String customerName;
    private String pickupAddress;
    private double pickupLat;
    private double pickupLng;
    private String deliveryAddress;
    private double deliveryLat;
    private double deliveryLng;
    private String packageDescription;
    private double weightKg;
    private double volumeM3;
    private int quantity;
    private ShipmentPriority priority;
    private LocalDate expectedDeliveryDate;
    private String warehouseId;
    private String notes;
}
