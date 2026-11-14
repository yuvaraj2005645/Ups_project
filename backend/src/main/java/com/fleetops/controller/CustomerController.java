package com.fleetops.controller;

import com.fleetops.dto.ApiResponse;
import com.fleetops.dto.CreateCustomerRequest;
import com.fleetops.dto.UpdateCustomerRequest;
import com.fleetops.model.Customer;
import com.fleetops.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Customer>>> getAllCustomers() {
        List<Customer> customers = customerService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(customers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> getCustomerById(@PathVariable String id) {
        Customer customer = customerService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(customer));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Customer>> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        Customer created = customerService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Customer registered successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ApiResponse<Customer>> updateCustomer(
            @PathVariable String id,
            @Valid @RequestBody UpdateCustomerRequest request
    ) {
        Customer updated = customerService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Customer updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable String id) {
        customerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer deleted successfully", null));
    }
}
