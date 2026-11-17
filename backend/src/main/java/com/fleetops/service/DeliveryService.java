package com.fleetops.service;

import com.fleetops.dto.CreateDeliveryRequest;
import com.fleetops.dto.ProofOfDeliveryRequest;
import com.fleetops.exception.BusinessRuleException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.model.*;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final InMemoryDataStore dataStore;
    private final ShipmentService shipmentService;
    private final DriverService driverService;
    private final VehicleService vehicleService;
    private final NotificationService notificationService;

    public List<Delivery> getAll(String driverId, String shipmentId) {
        return dataStore.findAllDeliveries().stream()
                .filter(d -> driverId == null || driverId.equals(d.getDriverId()))
                .filter(d -> shipmentId == null || shipmentId.equals(d.getShipmentId()))
                .sorted(Comparator.comparing(Delivery::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public Delivery getById(String id) {
        return dataStore.findDeliveryById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with ID: " + id));
    }

    public Delivery create(CreateDeliveryRequest request) {
        Shipment shipment = dataStore.findShipmentById(request.getShipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + request.getShipmentId()));

        Delivery delivery = Delivery.builder()
                .id(dataStore.generateDeliveryId())
                .shipmentId(shipment.getId())
                .driverId(request.getDriverId() != null ? request.getDriverId() : shipment.getDriverId())
                .vehicleId(request.getVehicleId() != null ? request.getVehicleId() : shipment.getVehicleId())
                .routeId(request.getRouteId() != null ? request.getRouteId() : shipment.getRouteId())
                .destinationAddress(request.getDestinationAddress() != null ? request.getDestinationAddress() : shipment.getDeliveryAddress())
                .destinationCity(request.getDestinationCity())
                .scheduledDate(request.getScheduledDate() != null ? request.getScheduledDate() : shipment.getExpectedDeliveryDate())
                .status(DeliveryStatus.SCHEDULED)
                .receiverName(request.getReceiverName())
                .remarks(request.getRemarks())
                .createdAt(LocalDateTime.now())
                .build();

        return dataStore.saveDelivery(delivery);
    }

    public Delivery updateStatus(String id, DeliveryStatus newStatus, String remarks, String failureReason) {
        Delivery delivery = getById(id);
        delivery.setStatus(newStatus);
        if (remarks != null) delivery.setRemarks(remarks);
        if (failureReason != null) delivery.setFailureReason(failureReason);

        if (newStatus == DeliveryStatus.DELIVERED) {
            delivery.setDeliveryDate(LocalDateTime.now());
            // Sync with shipment
            shipmentService.updateStatus(delivery.getShipmentId(), ShipmentStatus.DELIVERED, remarks, "SYSTEM");
        } else if (newStatus == DeliveryStatus.IN_TRANSIT) {
            shipmentService.updateStatus(delivery.getShipmentId(), ShipmentStatus.IN_TRANSIT, remarks, "SYSTEM");
        } else if (newStatus == DeliveryStatus.OUT_FOR_DELIVERY) {
            shipmentService.updateStatus(delivery.getShipmentId(), ShipmentStatus.OUT_FOR_DELIVERY, remarks, "SYSTEM");
        } else if (newStatus == DeliveryStatus.FAILED) {
            shipmentService.updateStatus(delivery.getShipmentId(), ShipmentStatus.FAILED_DELIVERY, failureReason, "SYSTEM");
        } else if (newStatus == DeliveryStatus.RETURNED) {
            shipmentService.updateStatus(delivery.getShipmentId(), ShipmentStatus.RETURNED, remarks, "SYSTEM");
        }

        return dataStore.saveDelivery(delivery);
    }

    public Delivery submitProof(String deliveryId, ProofOfDeliveryRequest request) {
        Delivery delivery = getById(deliveryId);
        Shipment shipment = dataStore.findShipmentById(delivery.getShipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + delivery.getShipmentId()));

        if (delivery.getStatus() != DeliveryStatus.OUT_FOR_DELIVERY
                || shipment.getStatus() != ShipmentStatus.OUT_FOR_DELIVERY) {
            throw new BusinessRuleException("Proof can only be submitted for an out-for-delivery shipment");
        }

        delivery.setReceiverName(request.getReceiverName());
        delivery.setReceiverPhone(request.getReceiverPhone());
        delivery.setReceiverRelationship(request.getReceiverRelationship());
        delivery.setProofPhotoBase64(request.getProofPhotoBase64());
        delivery.setSignatureBase64(request.getSignatureBase64());
        if (request.getRemarks() != null) {
            delivery.setRemarks(request.getRemarks());
        }
        delivery.setStatus(DeliveryStatus.DELIVERED);
        delivery.setDeliveryDate(LocalDateTime.now());

        // Update shipment status
        shipmentService.updateStatus(shipment.getId(), ShipmentStatus.DELIVERED,
                request.getRemarks() != null ? request.getRemarks() : "Delivered to " + request.getReceiverName(), "DRIVER");

        // Release vehicle load
        if (delivery.getVehicleId() != null) {
            vehicleService.releaseShipment(delivery.getVehicleId(), shipment.getWeightKg(), shipment.getVolumeM3());
        }

        // Release driver assignment & update metrics
        if (delivery.getDriverId() != null) {
            driverService.release(delivery.getDriverId(), shipment.getId());
            Driver driver = dataStore.findDriverById(delivery.getDriverId()).orElse(null);
            if (driver != null) {
                driver.setTotalDeliveries(driver.getTotalDeliveries() + 1);
                driver.setSuccessfulDeliveries(driver.getSuccessfulDeliveries() + 1);
                dataStore.saveDriver(driver);
            }
        }

        notificationService.addNotification(
                NotificationType.DELIVERY_COMPLETED,
                "Delivery Completed",
                "Delivery " + delivery.getId() + " confirmed delivered by receiver " + request.getReceiverName(),
                delivery.getId(),
                null
        );

        return dataStore.saveDelivery(delivery);
    }

    public void delete(String id) {
        if (!dataStore.deleteDelivery(id)) {
            throw new ResourceNotFoundException("Delivery not found with ID: " + id);
        }
    }
}
