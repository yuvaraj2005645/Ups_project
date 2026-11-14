package com.fleetops.service;

import com.fleetops.dto.CreateWarehouseRequest;
import com.fleetops.dto.UpdateWarehouseRequest;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.model.Warehouse;
import com.fleetops.model.WarehouseStatus;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final InMemoryDataStore dataStore;

    public List<Warehouse> getAll() {
        return dataStore.findAllWarehouses();
    }

    public Warehouse getById(String id) {
        return dataStore.findWarehouseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));
    }

    public Warehouse create(CreateWarehouseRequest request) {
        Warehouse warehouse = Warehouse.builder()
                .id(dataStore.generateWarehouseId())
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .lat(request.getLat())
                .lng(request.getLng())
                .managerName(request.getManagerName())
                .phone(request.getPhone())
                .totalCapacityM3(request.getTotalCapacityM3())
                .occupiedCapacityM3(request.getOccupiedCapacityM3())
                .status(request.getStatus() != null ? request.getStatus() : WarehouseStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        return dataStore.saveWarehouse(warehouse);
    }

    public Warehouse update(String id, UpdateWarehouseRequest request) {
        Warehouse warehouse = getById(id);

        if (request.getName() != null) warehouse.setName(request.getName());
        if (request.getAddress() != null) warehouse.setAddress(request.getAddress());
        if (request.getCity() != null) warehouse.setCity(request.getCity());
        if (request.getState() != null) warehouse.setState(request.getState());
        if (request.getLat() != null) warehouse.setLat(request.getLat());
        if (request.getLng() != null) warehouse.setLng(request.getLng());
        if (request.getManagerName() != null) warehouse.setManagerName(request.getManagerName());
        if (request.getPhone() != null) warehouse.setPhone(request.getPhone());
        if (request.getTotalCapacityM3() != null) warehouse.setTotalCapacityM3(request.getTotalCapacityM3());
        if (request.getOccupiedCapacityM3() != null) warehouse.setOccupiedCapacityM3(request.getOccupiedCapacityM3());
        if (request.getStatus() != null) warehouse.setStatus(request.getStatus());

        return dataStore.saveWarehouse(warehouse);
    }

    public void updateStorage(String id, double volumeDeltaM3) {
        Warehouse warehouse = getById(id);
        double newOccupied = Math.max(0, warehouse.getOccupiedCapacityM3() + volumeDeltaM3);
        warehouse.setOccupiedCapacityM3(Math.min(warehouse.getTotalCapacityM3(), newOccupied));
        dataStore.saveWarehouse(warehouse);
    }

    public void delete(String id) {
        if (!dataStore.deleteWarehouse(id)) {
            throw new ResourceNotFoundException("Warehouse not found with ID: " + id);
        }
    }
}
