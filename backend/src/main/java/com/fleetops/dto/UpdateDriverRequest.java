package com.fleetops.dto;

import com.fleetops.model.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDriverRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String licenseNumber;
    private LocalDate licenseExpiry;
    private Integer experienceYears;
    private DriverStatus status;
    private String vehicleId;
    private Double performanceRating;
}
