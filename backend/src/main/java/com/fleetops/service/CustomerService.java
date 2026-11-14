package com.fleetops.service;

import com.fleetops.dto.CreateCustomerRequest;
import com.fleetops.dto.UpdateCustomerRequest;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.model.Customer;
import com.fleetops.model.CustomerType;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final InMemoryDataStore dataStore;

    public List<Customer> getAll() {
        return dataStore.findAllCustomers();
    }

    public Customer getById(String id) {
        return dataStore.findCustomerById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
    }

    public Customer create(CreateCustomerRequest request) {
        Customer customer = Customer.builder()
                .id(dataStore.generateCustomerId())
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .type(request.getType() != null ? request.getType() : CustomerType.INDIVIDUAL)
                .registeredAt(LocalDateTime.now())
                .active(true)
                .build();
        return dataStore.saveCustomer(customer);
    }

    public Customer update(String id, UpdateCustomerRequest request) {
        Customer customer = getById(id);

        if (request.getName() != null) customer.setName(request.getName());
        if (request.getEmail() != null) customer.setEmail(request.getEmail());
        if (request.getPhone() != null) customer.setPhone(request.getPhone());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());
        if (request.getCity() != null) customer.setCity(request.getCity());
        if (request.getState() != null) customer.setState(request.getState());
        if (request.getPincode() != null) customer.setPincode(request.getPincode());
        if (request.getType() != null) customer.setType(request.getType());
        if (request.getActive() != null) customer.setActive(request.getActive());

        return dataStore.saveCustomer(customer);
    }

    public void delete(String id) {
        if (!dataStore.deleteCustomer(id)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + id);
        }
    }
}
