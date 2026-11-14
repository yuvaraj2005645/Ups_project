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
public class Customer {
    private String id; // CU-001
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private CustomerType type; // INDIVIDUAL, BUSINESS, ENTERPRISE
    private LocalDateTime registeredAt;
    private boolean active;
}
