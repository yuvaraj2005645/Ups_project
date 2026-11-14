package com.fleetops.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptimizeRouteRequest {
    private String warehouseId;

    @NotEmpty(message = "Stops list cannot be empty for optimization")
    @Builder.Default
    private List<StopRequest> stops = new ArrayList<>();
}
