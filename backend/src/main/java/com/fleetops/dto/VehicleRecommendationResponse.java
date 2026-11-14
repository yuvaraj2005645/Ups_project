package com.fleetops.dto;

import com.fleetops.model.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRecommendationResponse {
    private Vehicle vehicle;
    private double remainingWeight;
    private double remainingVolume;
    private double weightUtilizationPct;
    private double volumeUtilizationPct;
    private double recommendationScore;
    private String recommendationLabel;
    private boolean canAccommodate;
}
