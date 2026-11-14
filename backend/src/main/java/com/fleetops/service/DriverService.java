package com.fleetops.service;

import com.fleetops.dto.CreateDriverRequest;
import com.fleetops.dto.UpdateDriverRequest;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.model.Driver;
import com.fleetops.model.DriverStatus;
import com.fleetops.model.Shipment;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final InMemoryDataStore dataStore;

    public List<Driver> getAll() {
        return dataStore.findAllDrivers();
    }

    public Driver getById(String id) {
        return dataStore.findDriverById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));
    }

    public Driver create(CreateDriverRequest request) {
        Driver driver = Driver.builder()
                .id(dataStore.generateDriverId())
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .licenseNumber(request.getLicenseNumber())
                .licenseExpiry(request.getLicenseExpiry())
                .experienceYears(request.getExperienceYears())
                .status(DriverStatus.AVAILABLE)
                .vehicleId(request.getVehicleId())
                .currentShipmentIds(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .userId(request.getUserId())
                .performanceRating(5.0)
                .totalDeliveries(0)
                .successfulDeliveries(0)
                .build();
        return dataStore.saveDriver(driver);
    }

    public Driver update(String id, UpdateDriverRequest request) {
        Driver driver = getById(id);

        if (request.getName() != null) driver.setName(request.getName());
        if (request.getEmail() != null) driver.setEmail(request.getEmail());
        if (request.getPhone() != null) driver.setPhone(request.getPhone());
        if (request.getAddress() != null) driver.setAddress(request.getAddress());
        if (request.getCity() != null) driver.setCity(request.getCity());
        if (request.getLicenseNumber() != null) driver.setLicenseNumber(request.getLicenseNumber());
        if (request.getLicenseExpiry() != null) driver.setLicenseExpiry(request.getLicenseExpiry());
        if (request.getExperienceYears() != null) driver.setExperienceYears(request.getExperienceYears());
        if (request.getStatus() != null) driver.setStatus(request.getStatus());
        if (request.getVehicleId() != null) driver.setVehicleId(request.getVehicleId());
        if (request.getPerformanceRating() != null) driver.setPerformanceRating(request.getPerformanceRating());

        return dataStore.saveDriver(driver);
    }

    public void delete(String id) {
        if (!dataStore.deleteDriver(id)) {
            throw new ResourceNotFoundException("Driver not found with ID: " + id);
        }
    }

    public List<Driver> getAvailable() {
        return dataStore.findAllDrivers().stream()
                .filter(d -> d.getStatus() == DriverStatus.AVAILABLE)
                .collect(Collectors.toList());
    }

    public Driver assign(String driverId, String shipmentId) {
        Driver driver = getById(driverId);
        if (driver.getCurrentShipmentIds() == null) {
            driver.setCurrentShipmentIds(new ArrayList<>());
        }
        if (!driver.getCurrentShipmentIds().contains(shipmentId)) {
            driver.getCurrentShipmentIds().add(shipmentId);
        }
        if (driver.getStatus() == DriverStatus.AVAILABLE) {
            driver.setStatus(DriverStatus.ASSIGNED);
        }
        return dataStore.saveDriver(driver);
    }

    public Driver release(String driverId, String shipmentId) {
        Driver driver = dataStore.findDriverById(driverId).orElse(null);
        if (driver != null) {
            if (driver.getCurrentShipmentIds() != null) {
                driver.getCurrentShipmentIds().remove(shipmentId);
                if (driver.getCurrentShipmentIds().isEmpty() && driver.getStatus() != DriverStatus.ON_LEAVE && driver.getStatus() != DriverStatus.INACTIVE) {
                    driver.setStatus(DriverStatus.AVAILABLE);
                }
            }
            dataStore.saveDriver(driver);
        }
        return driver;
    }

    public List<Shipment> getDriverShipments(String driverId) {
        return dataStore.findAllShipments().stream()
                .filter(s -> driverId.equals(s.getDriverId()))
                .collect(Collectors.toList());
    }
}
