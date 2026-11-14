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
public class ShipmentHistory {
    private String id;
    private String shipmentId;
    private ShipmentStatus fromStatus;
    private ShipmentStatus toStatus;
    private String remarks;
    private String updatedBy;
    private LocalDateTime timestamp;
}
