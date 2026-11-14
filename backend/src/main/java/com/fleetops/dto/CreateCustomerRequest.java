package com.fleetops.dto;

import com.fleetops.model.CustomerType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCustomerRequest {
    @NotBlank(message = "Customer name is required")
    private String name;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String address;
    private String city;
    private String state;
    private String pincode;
    private CustomerType type;
}
