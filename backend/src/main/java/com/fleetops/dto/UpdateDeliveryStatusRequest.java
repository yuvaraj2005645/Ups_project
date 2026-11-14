package com.fleetops.dto;

import com.fleetops.model.DeliveryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDeliveryStatusRequest {
    @NotNull(message = "Status is required")
    private DeliveryStatus status;
    private String remarks;
    private String failureReason;
}
