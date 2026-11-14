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
public class Notification {
    private String id;
    private NotificationType type; // NEW_SHIPMENT, DRIVER_ASSIGNED, VEHICLE_ASSIGNED, SHIPMENT_DELAYED, DELIVERY_COMPLETED, VEHICLE_MAINTENANCE, LICENSE_EXPIRY
    private String title;
    private String message;
    private String relatedId;
    private String userId; // null means broadcast to all
    private boolean read;
    private LocalDateTime createdAt;
}
