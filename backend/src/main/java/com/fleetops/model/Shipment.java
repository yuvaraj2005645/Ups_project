package com.fleetops.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {
    private String id; // SH-1001
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
    private ShipmentPriority priority; // LOW, STANDARD, HIGH, URGENT
    private ShipmentStatus status;
    private LocalDate expectedDeliveryDate;
    private String driverId;
    private String vehicleId;
    private String routeId;
    private String warehouseId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String notes;
}
