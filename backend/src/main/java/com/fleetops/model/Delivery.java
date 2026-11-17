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
public class Delivery {
    private String id; // DL-001
    private String shipmentId;
    private String driverId;
    private String vehicleId;
    private String routeId;
    private String destinationAddress;
    private String destinationCity;
    private LocalDate scheduledDate;
    private LocalDateTime deliveryDate;
    private DeliveryStatus status; // SCHEDULED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED
    private String receiverName;
    private String receiverPhone;
    private String receiverRelationship;
    private String remarks;
    private String proofPhotoBase64;
    private String signatureBase64;
    private LocalDateTime createdAt;
    private String failureReason;
}
