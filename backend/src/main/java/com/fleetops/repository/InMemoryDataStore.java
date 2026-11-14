package com.fleetops.repository;

import com.fleetops.model.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

@Repository
public class InMemoryDataStore {

    private final ConcurrentHashMap<String, User> users = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Shipment> shipments = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Vehicle> vehicles = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Driver> drivers = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Route> routes = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Customer> customers = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Warehouse> warehouses = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Delivery> deliveries = new ConcurrentHashMap<>();
    private final CopyOnWriteArrayList<Notification> notifications = new CopyOnWriteArrayList<>();
    private final CopyOnWriteArrayList<ShipmentHistory> shipmentHistory = new CopyOnWriteArrayList<>();

    private final AtomicInteger userCounter = new AtomicInteger(0);
    private final AtomicInteger shipmentCounter = new AtomicInteger(1000);
    private final AtomicInteger vehicleCounter = new AtomicInteger(0);
    private final AtomicInteger driverCounter = new AtomicInteger(0);
    private final AtomicInteger routeCounter = new AtomicInteger(0);
    private final AtomicInteger customerCounter = new AtomicInteger(0);
    private final AtomicInteger warehouseCounter = new AtomicInteger(0);
    private final AtomicInteger deliveryCounter = new AtomicInteger(0);
    private final AtomicInteger notificationCounter = new AtomicInteger(0);
    private final AtomicInteger historyCounter = new AtomicInteger(0);

    public String generateUserId() {
        return String.format("USR-%03d", userCounter.incrementAndGet());
    }

    public String generateShipmentId() {
        return String.format("SH-%04d", shipmentCounter.incrementAndGet());
    }

    public String generateVehicleId() {
        return String.format("VH-%03d", vehicleCounter.incrementAndGet());
    }

    public String generateDriverId() {
        return String.format("DR-%03d", driverCounter.incrementAndGet());
    }

    public String generateRouteId() {
        return String.format("RT-%03d", routeCounter.incrementAndGet());
    }

    public String generateCustomerId() {
        return String.format("CU-%03d", customerCounter.incrementAndGet());
    }

    public String generateWarehouseId() {
        return String.format("WH-%03d", warehouseCounter.incrementAndGet());
    }

    public String generateDeliveryId() {
        return String.format("DL-%03d", deliveryCounter.incrementAndGet());
    }

    public String generateNotificationId() {
        return String.format("NT-%03d", notificationCounter.incrementAndGet());
    }

    public String generateHistoryId() {
        return String.format("SH-HIST-%04d", historyCounter.incrementAndGet());
    }

    // Direct collection access
    public ConcurrentHashMap<String, User> getUsers() {
        return users;
    }

    public ConcurrentHashMap<String, Shipment> getShipments() {
        return shipments;
    }

    public ConcurrentHashMap<String, Vehicle> getVehicles() {
        return vehicles;
    }

    public ConcurrentHashMap<String, Driver> getDrivers() {
        return drivers;
    }

    public ConcurrentHashMap<String, Route> getRoutes() {
        return routes;
    }

    public ConcurrentHashMap<String, Customer> getCustomers() {
        return customers;
    }

    public ConcurrentHashMap<String, Warehouse> getWarehouses() {
        return warehouses;
    }

    public ConcurrentHashMap<String, Delivery> getDeliveries() {
        return deliveries;
    }

    public CopyOnWriteArrayList<Notification> getNotifications() {
        return notifications;
    }

    public CopyOnWriteArrayList<ShipmentHistory> getShipmentHistory() {
        return shipmentHistory;
    }

    // User operations
    public Optional<User> findUserById(String id) {
        return Optional.ofNullable(users.get(id));
    }

    public Optional<User> findUserByEmail(String email) {
        if (email == null) return Optional.empty();
        return users.values().stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .findFirst();
    }

    public User saveUser(User user) {
        if (user.getId() == null || user.getId().isBlank()) {
            user.setId(generateUserId());
        }
        users.put(user.getId(), user);
        return user;
    }

    public boolean deleteUser(String id) {
        return users.remove(id) != null;
    }

    public List<User> findAllUsers() {
        return new ArrayList<>(users.values());
    }

    // Shipment operations
    public Optional<Shipment> findShipmentById(String id) {
        return Optional.ofNullable(shipments.get(id));
    }

    public Shipment saveShipment(Shipment shipment) {
        if (shipment.getId() == null || shipment.getId().isBlank()) {
            shipment.setId(generateShipmentId());
        }
        shipments.put(shipment.getId(), shipment);
        return shipment;
    }

    public boolean deleteShipment(String id) {
        return shipments.remove(id) != null;
    }

    public List<Shipment> findAllShipments() {
        return new ArrayList<>(shipments.values());
    }

    // Vehicle operations
    public Optional<Vehicle> findVehicleById(String id) {
        return Optional.ofNullable(vehicles.get(id));
    }

    public Vehicle saveVehicle(Vehicle vehicle) {
        if (vehicle.getId() == null || vehicle.getId().isBlank()) {
            vehicle.setId(generateVehicleId());
        }
        vehicles.put(vehicle.getId(), vehicle);
        return vehicle;
    }

    public boolean deleteVehicle(String id) {
        return vehicles.remove(id) != null;
    }

    public List<Vehicle> findAllVehicles() {
        return new ArrayList<>(vehicles.values());
    }

    // Driver operations
    public Optional<Driver> findDriverById(String id) {
        return Optional.ofNullable(drivers.get(id));
    }

    public Optional<Driver> findDriverByUserId(String userId) {
        if (userId == null) return Optional.empty();
        return drivers.values().stream()
                .filter(d -> userId.equals(d.getUserId()))
                .findFirst();
    }

    public Optional<Driver> findDriverByEmail(String email) {
        if (email == null) return Optional.empty();
        return drivers.values().stream()
                .filter(d -> email.equalsIgnoreCase(d.getEmail()))
                .findFirst();
    }

    public Driver saveDriver(Driver driver) {
        if (driver.getId() == null || driver.getId().isBlank()) {
            driver.setId(generateDriverId());
        }
        drivers.put(driver.getId(), driver);
        return driver;
    }

    public boolean deleteDriver(String id) {
        return drivers.remove(id) != null;
    }

    public List<Driver> findAllDrivers() {
        return new ArrayList<>(drivers.values());
    }

    // Route operations
    public Optional<Route> findRouteById(String id) {
        return Optional.ofNullable(routes.get(id));
    }

    public Route saveRoute(Route route) {
        if (route.getId() == null || route.getId().isBlank()) {
            route.setId(generateRouteId());
        }
        routes.put(route.getId(), route);
        return route;
    }

    public boolean deleteRoute(String id) {
        return routes.remove(id) != null;
    }

    public List<Route> findAllRoutes() {
        return new ArrayList<>(routes.values());
    }

    // Customer operations
    public Optional<Customer> findCustomerById(String id) {
        return Optional.ofNullable(customers.get(id));
    }

    public Customer saveCustomer(Customer customer) {
        if (customer.getId() == null || customer.getId().isBlank()) {
            customer.setId(generateCustomerId());
        }
        customers.put(customer.getId(), customer);
        return customer;
    }

    public boolean deleteCustomer(String id) {
        return customers.remove(id) != null;
    }

    public List<Customer> findAllCustomers() {
        return new ArrayList<>(customers.values());
    }

    // Warehouse operations
    public Optional<Warehouse> findWarehouseById(String id) {
        return Optional.ofNullable(warehouses.get(id));
    }

    public Warehouse saveWarehouse(Warehouse warehouse) {
        if (warehouse.getId() == null || warehouse.getId().isBlank()) {
            warehouse.setId(generateWarehouseId());
        }
        warehouses.put(warehouse.getId(), warehouse);
        return warehouse;
    }

    public boolean deleteWarehouse(String id) {
        return warehouses.remove(id) != null;
    }

    public List<Warehouse> findAllWarehouses() {
        return new ArrayList<>(warehouses.values());
    }

    // Delivery operations
    public Optional<Delivery> findDeliveryById(String id) {
        return Optional.ofNullable(deliveries.get(id));
    }

    public Optional<Delivery> findDeliveryByShipmentId(String shipmentId) {
        if (shipmentId == null) return Optional.empty();
        return deliveries.values().stream()
                .filter(d -> shipmentId.equals(d.getShipmentId()))
                .findFirst();
    }

    public Delivery saveDelivery(Delivery delivery) {
        if (delivery.getId() == null || delivery.getId().isBlank()) {
            delivery.setId(generateDeliveryId());
        }
        deliveries.put(delivery.getId(), delivery);
        return delivery;
    }

    public boolean deleteDelivery(String id) {
        return deliveries.remove(id) != null;
    }

    public List<Delivery> findAllDeliveries() {
        return new ArrayList<>(deliveries.values());
    }

    // Notification operations
    public Notification saveNotification(Notification notification) {
        if (notification.getId() == null || notification.getId().isBlank()) {
            notification.setId(generateNotificationId());
        }
        notifications.add(notification);
        return notification;
    }

    public List<Notification> findAllNotifications() {
        return new ArrayList<>(notifications);
    }

    // History operations
    public ShipmentHistory saveShipmentHistory(ShipmentHistory history) {
        if (history.getId() == null || history.getId().isBlank()) {
            history.setId(generateHistoryId());
        }
        shipmentHistory.add(history);
        return history;
    }

    public List<ShipmentHistory> findAllShipmentHistories() {
        return new ArrayList<>(shipmentHistory);
    }
}
