package com.fleetops.service;

import com.fleetops.dto.*;
import com.fleetops.exception.BusinessRuleException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.model.Shipment;
import com.fleetops.model.Vehicle;
import com.fleetops.model.VehicleStatus;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final InMemoryDataStore dataStore;

    public List<Vehicle> getAll() {
        return dataStore.findAllVehicles();
    }

    public Vehicle getById(String id) {
        return dataStore.findVehicleById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
    }

    public Vehicle create(CreateVehicleRequest request) {
        Vehicle vehicle = Vehicle.builder()
                .id(dataStore.generateVehicleId())
                .registrationNumber(request.getRegistrationNumber())
                .manufacturer(request.getManufacturer())
                .model(request.getModel())
                .type(request.getType())
                .maxWeightKg(request.getMaxWeightKg())
                .maxVolumeM3(request.getMaxVolumeM3())
                .currentWeightKg(0)
                .currentVolumeM3(0)
                .fuelType(request.getFuelType())
                .fuelTankCapacityL(request.getFuelTankCapacityL())
                .status(VehicleStatus.AVAILABLE)
                .driverId(request.getDriverId())
                .maintenanceDue(request.getMaintenanceDue())
                .lastMaintenance(request.getLastMaintenance())
                .year(request.getYear())
                .color(request.getColor())
                .build();
        return dataStore.saveVehicle(vehicle);
    }

    public Vehicle update(String id, UpdateVehicleRequest request) {
        Vehicle vehicle = getById(id);

        if (request.getRegistrationNumber() != null) vehicle.setRegistrationNumber(request.getRegistrationNumber());
        if (request.getManufacturer() != null) vehicle.setManufacturer(request.getManufacturer());
        if (request.getModel() != null) vehicle.setModel(request.getModel());
        if (request.getType() != null) vehicle.setType(request.getType());
        if (request.getMaxWeightKg() > 0) vehicle.setMaxWeightKg(request.getMaxWeightKg());
        if (request.getMaxVolumeM3() > 0) vehicle.setMaxVolumeM3(request.getMaxVolumeM3());
        if (request.getFuelType() != null) vehicle.setFuelType(request.getFuelType());
        if (request.getFuelTankCapacityL() > 0) vehicle.setFuelTankCapacityL(request.getFuelTankCapacityL());
        if (request.getStatus() != null) vehicle.setStatus(request.getStatus());
        if (request.getDriverId() != null) vehicle.setDriverId(request.getDriverId());
        if (request.getMaintenanceDue() != null) vehicle.setMaintenanceDue(request.getMaintenanceDue());
        if (request.getLastMaintenance() != null) vehicle.setLastMaintenance(request.getLastMaintenance());
        if (request.getYear() > 0) vehicle.setYear(request.getYear());
        if (request.getColor() != null) vehicle.setColor(request.getColor());

        return dataStore.saveVehicle(vehicle);
    }

    public void delete(String id) {
        if (!dataStore.deleteVehicle(id)) {
            throw new ResourceNotFoundException("Vehicle not found with ID: " + id);
        }
    }

    public VehicleCapacityResponse getCapacity(String vehicleId) {
        Vehicle vehicle = getById(vehicleId);
        double remainingWeight = Math.max(0, vehicle.getMaxWeightKg() - vehicle.getCurrentWeightKg());
        double remainingVolume = Math.max(0, vehicle.getMaxVolumeM3() - vehicle.getCurrentVolumeM3());
        double weightUtil = vehicle.getMaxWeightKg() > 0 ? (vehicle.getCurrentWeightKg() / vehicle.getMaxWeightKg() * 100.0) : 0;
        double volumeUtil = vehicle.getMaxVolumeM3() > 0 ? (vehicle.getCurrentVolumeM3() / vehicle.getMaxVolumeM3() * 100.0) : 0;

        return VehicleCapacityResponse.builder()
                .vehicleId(vehicle.getId())
                .maxWeightKg(vehicle.getMaxWeightKg())
                .maxVolumeM3(vehicle.getMaxVolumeM3())
                .currentWeightKg(vehicle.getCurrentWeightKg())
                .currentVolumeM3(vehicle.getCurrentVolumeM3())
                .remainingWeightKg(remainingWeight)
                .remainingVolumeM3(remainingVolume)
                .weightUtilizationPct(Math.round(weightUtil * 100.0) / 100.0)
                .volumeUtilizationPct(Math.round(volumeUtil * 100.0) / 100.0)
                .build();
    }

    public List<Vehicle> getAvailableVehicles() {
        return dataStore.findAllVehicles().stream()
                .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE)
                .collect(Collectors.toList());
    }

    public List<VehicleRecommendationResponse> allocateVehicle(AllocateVehicleRequest request) {
        double reqWeight = request.getWeightKg();
        double reqVolume = request.getVolumeM3();

        if (request.getShipmentId() != null && !request.getShipmentId().isBlank() && (reqWeight <= 0 || reqVolume <= 0)) {
            Shipment shipment = dataStore.findShipmentById(request.getShipmentId()).orElse(null);
            if (shipment != null) {
                if (reqWeight <= 0) reqWeight = shipment.getWeightKg();
                if (reqVolume <= 0) reqVolume = shipment.getVolumeM3();
            }
        }

        final double finalReqWeight = reqWeight;
        final double finalReqVolume = reqVolume;

        return dataStore.findAllVehicles().stream()
                .filter(v -> v.getStatus() != VehicleStatus.UNDER_MAINTENANCE && v.getStatus() != VehicleStatus.INACTIVE)
                .filter(v -> (v.getCurrentWeightKg() + finalReqWeight) <= v.getMaxWeightKg())
                .filter(v -> (v.getCurrentVolumeM3() + finalReqVolume) <= v.getMaxVolumeM3())
                .filter(v -> request.getVehicleType() == null || v.getType() == request.getVehicleType())
                .map(v -> {
                    double remWeight = v.getMaxWeightKg() - v.getCurrentWeightKg() - finalReqWeight;
                    double remVolume = v.getMaxVolumeM3() - v.getCurrentVolumeM3() - finalReqVolume;
                    double weightUtil = (v.getCurrentWeightKg() + finalReqWeight) / v.getMaxWeightKg() * 100.0;
                    double volumeUtil = (v.getCurrentVolumeM3() + finalReqVolume) / v.getMaxVolumeM3() * 100.0;
                    double score = (weightUtil + volumeUtil) / 2.0;
                    String label = score > 85 ? "Tight Fit" : (score > 60 ? "Good Fit" : "Optimal");

                    return VehicleRecommendationResponse.builder()
                            .vehicle(v)
                            .remainingWeight(Math.round(remWeight * 100.0) / 100.0)
                            .remainingVolume(Math.round(remVolume * 100.0) / 100.0)
                            .weightUtilizationPct(Math.round(weightUtil * 100.0) / 100.0)
                            .volumeUtilizationPct(Math.round(volumeUtil * 100.0) / 100.0)
                            .recommendationScore(Math.round(score * 100.0) / 100.0)
                            .recommendationLabel(label)
                            .canAccommodate(true)
                            .build();
                })
                .sorted(Comparator.comparingDouble(VehicleRecommendationResponse::getRecommendationScore).reversed())
                .collect(Collectors.toList());
    }

    public Vehicle confirmAllocation(String vehicleId, String shipmentId) {
        Vehicle vehicle = getById(vehicleId);
        Shipment shipment = dataStore.findShipmentById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        if ((vehicle.getCurrentWeightKg() + shipment.getWeightKg()) > vehicle.getMaxWeightKg()) {
            throw new BusinessRuleException("Vehicle weight capacity exceeded");
        }
        if ((vehicle.getCurrentVolumeM3() + shipment.getVolumeM3()) > vehicle.getMaxVolumeM3()) {
            throw new BusinessRuleException("Vehicle volume capacity exceeded");
        }

        vehicle.setCurrentWeightKg(vehicle.getCurrentWeightKg() + shipment.getWeightKg());
        vehicle.setCurrentVolumeM3(vehicle.getCurrentVolumeM3() + shipment.getVolumeM3());

        if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
            vehicle.setStatus(VehicleStatus.ASSIGNED);
        }

        shipment.setVehicleId(vehicle.getId());
        dataStore.saveShipment(shipment);
        return dataStore.saveVehicle(vehicle);
    }

    public void releaseShipment(String vehicleId, double weightKg, double volumeM3) {
        Vehicle vehicle = dataStore.findVehicleById(vehicleId).orElse(null);
        if (vehicle != null) {
            vehicle.setCurrentWeightKg(Math.max(0, vehicle.getCurrentWeightKg() - weightKg));
            vehicle.setCurrentVolumeM3(Math.max(0, vehicle.getCurrentVolumeM3() - volumeM3));
            if (vehicle.getCurrentWeightKg() == 0 && vehicle.getStatus() == VehicleStatus.ASSIGNED) {
                vehicle.setStatus(VehicleStatus.AVAILABLE);
            }
            dataStore.saveVehicle(vehicle);
        }
    }
}
