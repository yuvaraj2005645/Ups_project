package com.fleetops.dto;

import com.fleetops.model.CustomerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCustomerRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private CustomerType type;
    private Boolean active;
}
