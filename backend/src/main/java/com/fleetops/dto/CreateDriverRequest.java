package com.fleetops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDriverRequest {
    @NotBlank(message = "Driver name is required")
    private String name;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String address;
    private String city;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    private LocalDate licenseExpiry;
    private int experienceYears;
    private String vehicleId;
    private String userId;
}
