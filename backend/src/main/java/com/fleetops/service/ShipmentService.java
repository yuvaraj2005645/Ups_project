package com.fleetops.service;

import com.fleetops.dto.CreateShipmentRequest;
import com.fleetops.dto.UpdateShipmentRequest;
import com.fleetops.exception.BusinessRuleException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.model.*;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final InMemoryDataStore dataStore;
    private final NotificationService notificationService;
    private final VehicleService vehicleService;
    private final DriverService driverService;

    private static final Map<ShipmentStatus, Set<ShipmentStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(ShipmentStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(ShipmentStatus.PENDING, EnumSet.of(ShipmentStatus.SCHEDULED, ShipmentStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(ShipmentStatus.SCHEDULED, EnumSet.of(ShipmentStatus.ASSIGNED, ShipmentStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(ShipmentStatus.ASSIGNED, EnumSet.of(ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(ShipmentStatus.IN_TRANSIT, EnumSet.of(ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELAYED));
        ALLOWED_TRANSITIONS.put(ShipmentStatus.OUT_FOR_DELIVERY, EnumSet.of(ShipmentStatus.DELIVERED, ShipmentStatus.FAILED_DELIVERY));
        ALLOWED_TRANSITIONS.put(ShipmentStatus.DELAYED, EnumSet.of(ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(ShipmentStatus.FAILED_DELIVERY, EnumSet.of(ShipmentStatus.RETURNED, ShipmentStatus.IN_TRANSIT));
        ALLOWED_TRANSITIONS.put(ShipmentStatus.DELIVERED, EnumSet.noneOf(ShipmentStatus.class));
        ALLOWED_TRANSITIONS.put(ShipmentStatus.CANCELLED, EnumSet.noneOf(ShipmentStatus.class));
        ALLOWED_TRANSITIONS.put(ShipmentStatus.RETURNED, EnumSet.noneOf(ShipmentStatus.class));
    }

    public List<Shipment> getAll(ShipmentStatus status, String driverId, String vehicleId, String customerId, ShipmentPriority priority) {
        return dataStore.findAllShipments().stream()
                .filter(s -> status == null || s.getStatus() == status)
                .filter(s -> driverId == null || driverId.equalsIgnoreCase(s.getDriverId()))
                .filter(s -> vehicleId == null || vehicleId.equalsIgnoreCase(s.getVehicleId()))
                .filter(s -> customerId == null || customerId.equalsIgnoreCase(s.getCustomerId()))
                .filter(s -> priority == null || s.getPriority() == priority)
                .sorted(Comparator.comparing(Shipment::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public Shipment getById(String id) {
        return dataStore.findShipmentById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));
    }

    public Shipment create(CreateShipmentRequest request, String createdBy) {
        String custName = request.getCustomerName();
        if ((custName == null || custName.isBlank()) && request.getCustomerId() != null) {
            Customer c = dataStore.findCustomerById(request.getCustomerId()).orElse(null);
            if (c != null) {
                custName = c.getName();
            }
        }

        Shipment shipment = Shipment.builder()
                .id(dataStore.generateShipmentId())
                .customerId(request.getCustomerId())
                .customerName(custName != null ? custName : "Walk-in Customer")
                .pickupAddress(request.getPickupAddress())
                .pickupLat(request.getPickupLat())
                .pickupLng(request.getPickupLng())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryLat(request.getDeliveryLat())
                .deliveryLng(request.getDeliveryLng())
                .packageDescription(request.getPackageDescription())
                .weightKg(request.getWeightKg())
                .volumeM3(request.getVolumeM3())
                .quantity(request.getQuantity() > 0 ? request.getQuantity() : 1)
                .priority(request.getPriority() != null ? request.getPriority() : ShipmentPriority.STANDARD)
                .status(ShipmentStatus.PENDING)
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .warehouseId(request.getWarehouseId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(createdBy != null ? createdBy : "SYSTEM")
                .notes(request.getNotes())
                .build();

        Shipment saved = dataStore.saveShipment(shipment);

        // Record initial history
        recordHistory(saved.getId(), null, ShipmentStatus.PENDING, "Shipment created", createdBy);

        // Create notification
        notificationService.addNotification(
                NotificationType.NEW_SHIPMENT,
                "New Shipment Created",
                "Shipment " + saved.getId() + " created for " + saved.getCustomerName(),
                saved.getId(),
                null
        );

        return saved;
    }

    public Shipment update(String id, UpdateShipmentRequest request) {
        Shipment shipment = getById(id);

        if (request.getCustomerId() != null) shipment.setCustomerId(request.getCustomerId());
        if (request.getCustomerName() != null) shipment.setCustomerName(request.getCustomerName());
        if (request.getPickupAddress() != null) shipment.setPickupAddress(request.getPickupAddress());
        if (request.getPickupLat() != 0) shipment.setPickupLat(request.getPickupLat());
        if (request.getPickupLng() != 0) shipment.setPickupLng(request.getPickupLng());
        if (request.getDeliveryAddress() != null) shipment.setDeliveryAddress(request.getDeliveryAddress());
        if (request.getDeliveryLat() != 0) shipment.setDeliveryLat(request.getDeliveryLat());
        if (request.getDeliveryLng() != 0) shipment.setDeliveryLng(request.getDeliveryLng());
        if (request.getPackageDescription() != null) shipment.setPackageDescription(request.getPackageDescription());
        if (request.getWeightKg() > 0) shipment.setWeightKg(request.getWeightKg());
        if (request.getVolumeM3() > 0) shipment.setVolumeM3(request.getVolumeM3());
        if (request.getQuantity() > 0) shipment.setQuantity(request.getQuantity());
        if (request.getPriority() != null) shipment.setPriority(request.getPriority());
        if (request.getExpectedDeliveryDate() != null) shipment.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        if (request.getWarehouseId() != null) shipment.setWarehouseId(request.getWarehouseId());
        if (request.getNotes() != null) shipment.setNotes(request.getNotes());

        shipment.setUpdatedAt(LocalDateTime.now());
        return dataStore.saveShipment(shipment);
    }

    public Shipment updateStatus(String id, ShipmentStatus newStatus, String remarks, String updatedBy) {
        Shipment shipment = getById(id);
        ShipmentStatus currentStatus = shipment.getStatus();

        if (currentStatus == newStatus) {
            return shipment;
        }

        Set<ShipmentStatus> allowed = ALLOWED_TRANSITIONS.get(currentStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new BusinessRuleException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        shipment.setStatus(newStatus);
        shipment.setUpdatedAt(LocalDateTime.now());
        dataStore.saveShipment(shipment);

        syncDeliveryStatus(shipment, newStatus, remarks);
        recordHistory(shipment.getId(), currentStatus, newStatus, remarks, updatedBy);

        if (newStatus == ShipmentStatus.DELAYED) {
            notificationService.addNotification(
                    NotificationType.SHIPMENT_DELAYED,
                    "Shipment Delayed",
                    "Shipment " + shipment.getId() + " is delayed. Reason: " + (remarks != null ? remarks : "Unforeseen traffic"),
                    shipment.getId(),
                    null
            );
        } else if (newStatus == ShipmentStatus.DELIVERED) {
            notificationService.addNotification(
                    NotificationType.DELIVERY_COMPLETED,
                    "Delivery Completed",
                    "Shipment " + shipment.getId() + " has been successfully delivered",
                    shipment.getId(),
                    null
            );
        }

        return shipment;
    }

    private void syncDeliveryStatus(Shipment shipment, ShipmentStatus status, String remarks) {
        Delivery delivery = dataStore.findDeliveryByShipmentId(shipment.getId()).orElse(null);
        if (delivery == null) {
            return;
        }

        DeliveryStatus deliveryStatus = switch (status) {
            case IN_TRANSIT -> DeliveryStatus.IN_TRANSIT;
            case OUT_FOR_DELIVERY -> DeliveryStatus.OUT_FOR_DELIVERY;
            case DELIVERED -> DeliveryStatus.DELIVERED;
            case FAILED_DELIVERY -> DeliveryStatus.FAILED;
            case RETURNED -> DeliveryStatus.RETURNED;
            default -> null;
        };
        if (deliveryStatus == null) {
            return;
        }

        delivery.setStatus(deliveryStatus);
        if (remarks != null) {
            delivery.setRemarks(remarks);
        }
        if (deliveryStatus == DeliveryStatus.DELIVERED) {
            delivery.setDeliveryDate(LocalDateTime.now());
        }
        dataStore.saveDelivery(delivery);
    }

    public Shipment assign(String shipmentId, String driverId, String vehicleId, String routeId) {
        Shipment shipment = getById(shipmentId);
        Driver driver = driverService.getById(driverId);
        Vehicle vehicle = vehicleService.getById(vehicleId);

        // Check vehicle capacity
        if ((vehicle.getCurrentWeightKg() + shipment.getWeightKg()) > vehicle.getMaxWeightKg()) {
            throw new BusinessRuleException("Cannot assign: Vehicle weight capacity exceeded (" +
                    (vehicle.getCurrentWeightKg() + shipment.getWeightKg()) + "kg > " + vehicle.getMaxWeightKg() + "kg)");
        }
        if ((vehicle.getCurrentVolumeM3() + shipment.getVolumeM3()) > vehicle.getMaxVolumeM3()) {
            throw new BusinessRuleException("Cannot assign: Vehicle volume capacity exceeded (" +
                    (vehicle.getCurrentVolumeM3() + shipment.getVolumeM3()) + "m3 > " + vehicle.getMaxVolumeM3() + "m3)");
        }

        shipment.setDriverId(driver.getId());
        shipment.setVehicleId(vehicle.getId());
        if (routeId != null && !routeId.isBlank()) {
            shipment.setRouteId(routeId);
            Route route = dataStore.findRouteById(routeId).orElse(null);
            if (route != null && !route.getShipmentIds().contains(shipment.getId())) {
                route.getShipmentIds().add(shipment.getId());
                dataStore.saveRoute(route);
            }
        }

        // Update driver
        driverService.assign(driver.getId(), shipment.getId());

        // Update vehicle capacity
        vehicleService.confirmAllocation(vehicle.getId(), shipment.getId());

        // Update status if currently PENDING or SCHEDULED
        if (shipment.getStatus() == ShipmentStatus.PENDING || shipment.getStatus() == ShipmentStatus.SCHEDULED) {
            ShipmentStatus oldStatus = shipment.getStatus();
            shipment.setStatus(ShipmentStatus.ASSIGNED);
            recordHistory(shipment.getId(), oldStatus, ShipmentStatus.ASSIGNED, "Assigned to driver " + driver.getName() + " and vehicle " + vehicle.getRegistrationNumber(), "SYSTEM");
        }

        shipment.setUpdatedAt(LocalDateTime.now());
        Shipment saved = dataStore.saveShipment(shipment);

        notificationService.addNotification(
                NotificationType.DRIVER_ASSIGNED,
                "Driver Assigned",
                "Driver " + driver.getName() + " assigned to shipment " + shipment.getId(),
                shipment.getId(),
                driver.getUserId()
        );

        notificationService.addNotification(
                NotificationType.VEHICLE_ASSIGNED,
                "Vehicle Assigned",
                "Vehicle " + vehicle.getRegistrationNumber() + " assigned to shipment " + shipment.getId(),
                shipment.getId(),
                null
        );

        return saved;
    }

    public List<ShipmentHistory> getHistory(String shipmentId) {
        return dataStore.findAllShipmentHistories().stream()
                .filter(h -> shipmentId.equalsIgnoreCase(h.getShipmentId()))
                .sorted(Comparator.comparing(ShipmentHistory::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public void delete(String id) {
        if (!dataStore.deleteShipment(id)) {
            throw new ResourceNotFoundException("Shipment not found with ID: " + id);
        }
    }

    private void recordHistory(String shipmentId, ShipmentStatus fromStatus, ShipmentStatus toStatus, String remarks, String updatedBy) {
        ShipmentHistory history = ShipmentHistory.builder()
                .id(dataStore.generateHistoryId())
                .shipmentId(shipmentId)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .remarks(remarks != null ? remarks : "Status updated to " + toStatus)
                .updatedBy(updatedBy != null ? updatedBy : "SYSTEM")
                .timestamp(LocalDateTime.now())
                .build();
        dataStore.saveShipmentHistory(history);
    }
}
