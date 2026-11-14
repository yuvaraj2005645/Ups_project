package com.fleetops.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {
    private String id; // DR-001
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String licenseNumber;
    private LocalDate licenseExpiry;
    private int experienceYears;
    private DriverStatus status; // AVAILABLE, ASSIGNED, ON_DELIVERY, ON_LEAVE, INACTIVE
    private String vehicleId;
    @Builder.Default
    private List<String> currentShipmentIds = new ArrayList<>();
    private LocalDateTime createdAt;
    private String userId; // linked User account
    private double performanceRating;
    private int totalDeliveries;
    private int successfulDeliveries;
}
