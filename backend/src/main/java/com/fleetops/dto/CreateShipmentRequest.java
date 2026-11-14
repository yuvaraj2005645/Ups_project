package com.fleetops.dto;

import com.fleetops.model.ShipmentPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShipmentRequest {
    private String customerId;
    private String customerName;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;
    private double pickupLat;
    private double pickupLng;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
    private double deliveryLat;
    private double deliveryLng;

    private String packageDescription;

    @Positive(message = "Weight must be greater than zero")
    private double weightKg;

    @Positive(message = "Volume must be greater than zero")
    private double volumeM3;

    private int quantity;
    private ShipmentPriority priority;
    private LocalDate expectedDeliveryDate;
    private String warehouseId;
    private String notes;
}
