package com.fleetops.initializer;

import com.fleetops.model.*;
import com.fleetops.repository.InMemoryDataStore;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SampleDataInitializer {

    private final InMemoryDataStore dataStore;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        log.info("Initializing FleetOps sample data in memory...");

        initUsers();
        initWarehouses();
        initCustomers();
        initVehicles();
        initDrivers();
        initRoutes();
        initShipments();
        initDeliveries();
        initShipmentHistory();
        initNotifications();

        log.info("FleetOps sample data initialized successfully!");
    }

    private void initUsers() {
        User admin = User.builder()
                .id("USR-001")
                .name("Arjun Sharma")
                .email("admin@fleetops.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .phone("+91-9840112201")
                .active(true)
                .createdAt(LocalDateTime.now().minusDays(90))
                .lastLogin(LocalDateTime.now().minusHours(2))
                .build();

        User dispatcher = User.builder()
                .id("USR-002")
                .name("Priya Nair")
                .email("dispatcher@fleetops.com")
                .password(passwordEncoder.encode("Dispatch@123"))
                .role(Role.DISPATCHER)
                .phone("+91-9840112202")
                .active(true)
                .createdAt(LocalDateTime.now().minusDays(60))
                .lastLogin(LocalDateTime.now().minusHours(5))
                .build();

        User driver = User.builder()
                .id("USR-003")
                .name("Ravi Kumar")
                .email("driver@fleetops.com")
                .password(passwordEncoder.encode("Driver@123"))
                .role(Role.DRIVER)
                .phone("+91-9876543210")
                .active(true)
                .createdAt(LocalDateTime.now().minusDays(30))
                .lastLogin(LocalDateTime.now().minusDays(1))
                .build();

        dataStore.saveUser(admin);
        dataStore.saveUser(dispatcher);
        dataStore.saveUser(driver);
    }

    private void initWarehouses() {
        dataStore.saveWarehouse(Warehouse.builder()
                .id("WH-001")
                .name("Chennai Central Warehouse")
                .address("Ambattur Industrial Estate, Chennai")
                .city("Chennai")
                .state("Tamil Nadu")
                .lat(13.0827)
                .lng(80.2707)
                .managerName("Rajesh Kannan")
                .phone("+91-9840112233")
                .totalCapacityM3(10000.0)
                .occupiedCapacityM3(3500.0)
                .status(WarehouseStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(120))
                .build());

        dataStore.saveWarehouse(Warehouse.builder()
                .id("WH-002")
                .name("Bangalore Distribution Center")
                .address("Peenya Industrial Area, Bangalore")
                .city("Bangalore")
                .state("Karnataka")
                .lat(13.0303)
                .lng(77.5597)
                .managerName("Sunil Gowda")
                .phone("+91-9840112234")
                .totalCapacityM3(15000.0)
                .occupiedCapacityM3(6200.0)
                .status(WarehouseStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(110))
                .build());

        dataStore.saveWarehouse(Warehouse.builder()
                .id("WH-003")
                .name("Coimbatore Logistics Hub")
                .address("SIDCO Industrial Estate, Coimbatore")
                .city("Coimbatore")
                .state("Tamil Nadu")
                .lat(11.0168)
                .lng(76.9558)
                .managerName("K. Palanisamy")
                .phone("+91-9840112235")
                .totalCapacityM3(8000.0)
                .occupiedCapacityM3(2900.0)
                .status(WarehouseStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(100))
                .build());

        dataStore.saveWarehouse(Warehouse.builder()
                .id("WH-004")
                .name("Madurai Freight Center")
                .address("Kappalur Industrial Area, Madurai")
                .city("Madurai")
                .state("Tamil Nadu")
                .lat(9.9252)
                .lng(78.1198)
                .managerName("M. Thangavel")
                .phone("+91-9840112236")
                .totalCapacityM3(7000.0)
                .occupiedCapacityM3(2100.0)
                .status(WarehouseStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(90))
                .build());

        dataStore.saveWarehouse(Warehouse.builder()
                .id("WH-005")
                .name("Salem Regional Depot")
                .address("Fairlands, Salem")
                .city("Salem")
                .state("Tamil Nadu")
                .lat(11.6643)
                .lng(78.1460)
                .managerName("R. Natarajan")
                .phone("+91-9840112237")
                .totalCapacityM3(6000.0)
                .occupiedCapacityM3(1800.0)
                .status(WarehouseStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(80))
                .build());
    }

    private void initCustomers() {
        String[][] custData = {
                {"CU-001", "Arun Kumar", "arun.kumar@gmail.com", "9841023451", "12, Anna Nagar Main Rd", "Chennai", "Tamil Nadu", "600040", "INDIVIDUAL"},
                {"CU-002", "Meena Krishnan", "meena.k@technocorp.in", "9841023452", "45, Electronic City Phase 1", "Bangalore", "Karnataka", "560100", "ENTERPRISE"},
                {"CU-003", "Suresh Babu", "suresh.babu@babusons.com", "9841023453", "88, Cross Cut Road", "Coimbatore", "Tamil Nadu", "641012", "BUSINESS"},
                {"CU-004", "Deepa Sundaram", "deepa.s@gmail.com", "9841023454", "31, Gandhi Road", "Vellore", "Tamil Nadu", "632004", "INDIVIDUAL"},
                {"CU-005", "Rajesh Patel", "rajesh@pateltraders.com", "9841023455", "102, OMR IT Highway, Sholinganallur", "Chennai", "Tamil Nadu", "600119", "BUSINESS"},
                {"CU-006", "Anitha Rao", "anitha.rao@infosysnet.com", "9841023456", "22, Koramangala 4th Block", "Bangalore", "Karnataka", "560034", "ENTERPRISE"},
                {"CU-007", "Karthik Subramanian", "karthik.sub@gmail.com", "9841023457", "15, Katpadi Main Road", "Katpadi", "Tamil Nadu", "632014", "INDIVIDUAL"},
                {"CU-008", "Lakshmi Devi", "lakshmi.devi@textiles.in", "9841023458", "67, Avinashi Road, Peelamedu", "Coimbatore", "Tamil Nadu", "641004", "ENTERPRISE"},
                {"CU-009", "Venkatesh Murugan", "venkat.m@muruganshop.com", "9841023459", "4/12, Madurai Main Bazaar", "Madurai", "Tamil Nadu", "625001", "BUSINESS"},
                {"CU-010", "Sridevi Nair", "sridevi.nair@outlook.com", "9841023460", "78, 5th Avenue, Indiranagar", "Bangalore", "Karnataka", "560038", "INDIVIDUAL"},
                {"CU-011", "Mohan Rajan", "mohan.rajan@ssteel.in", "9841023461", "19, Junction Main Road", "Salem", "Tamil Nadu", "636004", "BUSINESS"},
                {"CU-012", "Preethi Shankar", "preethi.s@gmail.com", "9841023462", "53, SIPCOT Industrial Complex", "Ranipet", "Tamil Nadu", "632403", "BUSINESS"},
                {"CU-013", "Balaji Venkat", "balaji.v@vlogistics.com", "9841023463", "84, GST Road, Chengalpattu", "Chengalpattu", "Tamil Nadu", "603001", "ENTERPRISE"},
                {"CU-014", "Saranya Pandian", "saranya.p@yahoo.com", "9841023464", "9, Big Kanchipuram Weavers Colony", "Kanchipuram", "Tamil Nadu", "631502", "INDIVIDUAL"},
                {"CU-015", "Dinesh Pillai", "dinesh.pillai@autospares.in", "9841023465", "110, Hosur Industrial Complex", "Hosur", "Tamil Nadu", "635126", "BUSINESS"}
        };

        for (String[] c : custData) {
            dataStore.saveCustomer(Customer.builder()
                    .id(c[0])
                    .name(c[1])
                    .email(c[2])
                    .phone(c[3])
                    .address(c[4])
                    .city(c[5])
                    .state(c[6])
                    .pincode(c[7])
                    .type(CustomerType.valueOf(c[8]))
                    .registeredAt(LocalDateTime.now().minusDays(50))
                    .active(true)
                    .build());
        }
    }

    private void initVehicles() {
        dataStore.saveVehicle(Vehicle.builder()
                .id("VH-001")
                .registrationNumber("TN01AB1234")
                .manufacturer("Tata")
                .model("Ace")
                .type(VehicleType.MINI_TRUCK)
                .maxWeightKg(800.0)
                .maxVolumeM3(8.0)
                .currentWeightKg(300.0)
                .currentVolumeM3(3.0)
                .fuelType(FuelType.DIESEL)
                .fuelTankCapacityL(30.0)
                .status(VehicleStatus.AVAILABLE)
                .driverId("DR-002")
                .maintenanceDue("2026-12-15")
                .lastMaintenance("2026-09-15")
                .year(2021)
                .color("White")
                .build());

        dataStore.saveVehicle(Vehicle.builder()
                .id("VH-002")
                .registrationNumber("TN02CD5678")
                .manufacturer("Mahindra")
                .model("Bolero Pickup")
                .type(VehicleType.PICKUP_TRUCK)
                .maxWeightKg(1200.0)
                .maxVolumeM3(10.0)
                .currentWeightKg(850.0)
                .currentVolumeM3(7.5)
                .fuelType(FuelType.DIESEL)
                .fuelTankCapacityL(45.0)
                .status(VehicleStatus.IN_TRANSIT)
                .driverId("DR-001")
                .maintenanceDue("2026-11-20")
                .lastMaintenance("2026-08-20")
                .year(2022)
                .color("Silver")
                .build());

        dataStore.saveVehicle(Vehicle.builder()
                .id("VH-003")
                .registrationNumber("TN03EF9012")
                .manufacturer("Ashok Leyland")
                .model("Dost")
                .type(VehicleType.DELIVERY_VAN)
                .maxWeightKg(1500.0)
                .maxVolumeM3(15.0)
                .currentWeightKg(650.0)
                .currentVolumeM3(6.0)
                .fuelType(FuelType.DIESEL)
                .fuelTankCapacityL(50.0)
                .status(VehicleStatus.ASSIGNED)
                .driverId("DR-003")
                .maintenanceDue("2026-12-30")
                .lastMaintenance("2026-09-30")
                .year(2021)
                .color("Blue")
                .build());

        dataStore.saveVehicle(Vehicle.builder()
                .id("VH-004")
                .registrationNumber("TN04GH3456")
                .manufacturer("Eicher")
                .model("Pro 2049")
                .type(VehicleType.HEAVY_TRUCK)
                .maxWeightKg(5000.0)
                .maxVolumeM3(40.0)
                .currentWeightKg(2000.0)
                .currentVolumeM3(16.0)
                .fuelType(FuelType.DIESEL)
                .fuelTankCapacityL(120.0)
                .status(VehicleStatus.IN_TRANSIT)
                .driverId("DR-004")
                .maintenanceDue("2027-01-10")
                .lastMaintenance("2026-10-10")
                .year(2020)
                .color("Yellow")
                .build());

        dataStore.saveVehicle(Vehicle.builder()
                .id("VH-005")
                .registrationNumber("TN05IJ7890")
                .manufacturer("Tata")
                .model("407")
                .type(VehicleType.HEAVY_TRUCK)
                .maxWeightKg(4000.0)
                .maxVolumeM3(35.0)
                .currentWeightKg(0.0)
                .currentVolumeM3(0.0)
                .fuelType(FuelType.DIESEL)
                .fuelTankCapacityL(90.0)
                .status(VehicleStatus.AVAILABLE)
                .driverId(null)
                .maintenanceDue("2026-12-01")
                .lastMaintenance("2026-09-01")
                .year(2019)
                .color("Brown")
                .build());

        dataStore.saveVehicle(Vehicle.builder()
                .id("VH-006")
                .registrationNumber("TN06KL2345")
                .manufacturer("Mahindra")
                .model("Supro")
                .type(VehicleType.DELIVERY_VAN)
                .maxWeightKg(1000.0)
                .maxVolumeM3(12.0)
                .currentWeightKg(200.0)
                .currentVolumeM3(2.0)
                .fuelType(FuelType.DIESEL)
                .fuelTankCapacityL(35.0)
                .status(VehicleStatus.AVAILABLE)
                .driverId("DR-006")
                .maintenanceDue("2027-02-15")
                .lastMaintenance("2026-10-15")
                .year(2022)
                .color("White")
                .build());

        dataStore.saveVehicle(Vehicle.builder()
                .id("VH-007")
                .registrationNumber("TN07MN6789")
                .manufacturer("Tata")
                .model("Prima")
                .type(VehicleType.CONTAINER_TRUCK)
                .maxWeightKg(15000.0)
                .maxVolumeM3(80.0)
                .currentWeightKg(5000.0)
                .currentVolumeM3(30.0)
                .fuelType(FuelType.DIESEL)
                .fuelTankCapacityL(300.0)
                .status(VehicleStatus.IN_TRANSIT)
                .driverId("DR-007")
                .maintenanceDue("2027-03-01")
                .lastMaintenance("2026-10-01")
                .year(2023)
                .color("Red")
                .build());

        dataStore.saveVehicle(Vehicle.builder()
                .id("VH-008")
                .registrationNumber("TN08OP1234")
                .manufacturer("Ashok Leyland")
                .model("Partner")
                .type(VehicleType.MINI_TRUCK)
                .maxWeightKg(750.0)
                .maxVolumeM3(7.0)
                .currentWeightKg(0.0)
                .currentVolumeM3(0.0)
                .fuelType(FuelType.DIESEL)
                .fuelTankCapacityL(30.0)
                .status(VehicleStatus.UNDER_MAINTENANCE)
                .driverId(null)
                .maintenanceDue("2026-11-01")
                .lastMaintenance("2026-07-01")
                .year(2018)
                .color("Green")
                .build());

        dataStore.saveVehicle(Vehicle.builder()
                .id("VH-009")
                .registrationNumber("TN09QR5678")
                .manufacturer("Force")
                .model("Traveller")
                .type(VehicleType.DELIVERY_VAN)
                .maxWeightKg(1300.0)
                .maxVolumeM3(14.0)
                .currentWeightKg(600.0)
                .currentVolumeM3(5.0)
                .fuelType(FuelType.DIESEL)
                .fuelTankCapacityL(60.0)
                .status(VehicleStatus.AVAILABLE)
                .driverId("DR-009")
                .maintenanceDue("2027-01-20")
                .lastMaintenance("2026-09-20")
                .year(2021)
                .color("White")
                .build());

        dataStore.saveVehicle(Vehicle.builder()
                .id("VH-010")
                .registrationNumber("TN10ST9012")
                .manufacturer("Bharat Benz")
                .model("1217")
                .type(VehicleType.HEAVY_TRUCK)
                .maxWeightKg(6000.0)
                .maxVolumeM3(50.0)
                .currentWeightKg(0.0)
                .currentVolumeM3(0.0)
                .fuelType(FuelType.DIESEL)
                .fuelTankCapacityL(150.0)
                .status(VehicleStatus.INACTIVE)
                .driverId(null)
                .maintenanceDue("2026-10-10")
                .lastMaintenance("2026-05-10")
                .year(2017)
                .color("Blue")
                .build());
    }

    private void initDrivers() {
        dataStore.saveDriver(Driver.builder()
                .id("DR-001")
                .name("Ravi Kumar")
                .email("driver@fleetops.com")
                .phone("9876543210")
                .address("45, South Mada St, Mylapore")
                .city("Chennai")
                .licenseNumber("TN-DL-2026-001234")
                .licenseExpiry(LocalDate.now().plusYears(3))
                .experienceYears(6)
                .status(DriverStatus.ON_DELIVERY)
                .vehicleId("VH-002")
                .currentShipmentIds(new ArrayList<>(List.of("SH-1002")))
                .createdAt(LocalDateTime.now().minusDays(180))
                .userId("USR-003")
                .performanceRating(4.8)
                .totalDeliveries(120)
                .successfulDeliveries(118)
                .build());

        dataStore.saveDriver(Driver.builder()
                .id("DR-002")
                .name("Suresh Pillai")
                .email("suresh.pillai@fleetops.com")
                .phone("9876543211")
                .address("12, Trunk Road, Poonamallee")
                .city("Chennai")
                .licenseNumber("TN-DL-2024-005678")
                .licenseExpiry(LocalDate.now().plusMonths(8))
                .experienceYears(5)
                .status(DriverStatus.AVAILABLE)
                .vehicleId("VH-001")
                .currentShipmentIds(new ArrayList<>(List.of("SH-1001")))
                .createdAt(LocalDateTime.now().minusDays(150))
                .userId(null)
                .performanceRating(4.6)
                .totalDeliveries(95)
                .successfulDeliveries(92)
                .build());

        dataStore.saveDriver(Driver.builder()
                .id("DR-003")
                .name("Murugan Selvam")
                .email("murugan.selvam@fleetops.com")
                .phone("9876543212")
                .address("88, Gandhi Nagar")
                .city("Vellore")
                .licenseNumber("TN-DL-2025-009012")
                .licenseExpiry(LocalDate.now().plusYears(1))
                .experienceYears(8)
                .status(DriverStatus.ON_DELIVERY)
                .vehicleId("VH-003")
                .currentShipmentIds(new ArrayList<>(List.of("SH-1007", "SH-1008")))
                .createdAt(LocalDateTime.now().minusDays(200))
                .userId(null)
                .performanceRating(4.9)
                .totalDeliveries(150)
                .successfulDeliveries(148)
                .build());

        dataStore.saveDriver(Driver.builder()
                .id("DR-004")
                .name("Senthil Kumar")
                .email("senthil.k@fleetops.com")
                .phone("9876543213")
                .address("23, Bangalore Highway")
                .city("Kanchipuram")
                .licenseNumber("TN-DL-2023-003456")
                .licenseExpiry(LocalDate.now().plusMonths(4))
                .experienceYears(4)
                .status(DriverStatus.ON_DELIVERY)
                .vehicleId("VH-004")
                .currentShipmentIds(new ArrayList<>(List.of("SH-1010", "SH-1011")))
                .createdAt(LocalDateTime.now().minusDays(120))
                .userId(null)
                .performanceRating(4.5)
                .totalDeliveries(80)
                .successfulDeliveries(75)
                .build());

        dataStore.saveDriver(Driver.builder()
                .id("DR-005")
                .name("Balakrishnan R")
                .email("bala.r@fleetops.com")
                .phone("9876543214")
                .address("15, Cross Cut Rd")
                .city("Coimbatore")
                .licenseNumber("TN-DL-2027-007890")
                .licenseExpiry(LocalDate.now().plusYears(2))
                .experienceYears(7)
                .status(DriverStatus.AVAILABLE)
                .vehicleId(null)
                .currentShipmentIds(new ArrayList<>())
                .createdAt(LocalDateTime.now().minusDays(160))
                .userId(null)
                .performanceRating(4.7)
                .totalDeliveries(110)
                .successfulDeliveries(107)
                .build());

        dataStore.saveDriver(Driver.builder()
                .id("DR-006")
                .name("Annamalai T")
                .email("annamalai.t@fleetops.com")
                .phone("9876543215")
                .address("5, Periyar Nagar")
                .city("Ranipet")
                .licenseNumber("TN-DL-2024-002345")
                .licenseExpiry(LocalDate.now().plusMonths(10))
                .experienceYears(3)
                .status(DriverStatus.AVAILABLE)
                .vehicleId("VH-006")
                .currentShipmentIds(new ArrayList<>(List.of("SH-1006")))
                .createdAt(LocalDateTime.now().minusDays(90))
                .userId(null)
                .performanceRating(4.3)
                .totalDeliveries(60)
                .successfulDeliveries(56)
                .build());

        dataStore.saveDriver(Driver.builder()
                .id("DR-007")
                .name("Pandian M")
                .email("pandian.m@fleetops.com")
                .phone("9876543216")
                .address("32, Simmakkal Street")
                .city("Madurai")
                .licenseNumber("TN-DL-2025-006789")
                .licenseExpiry(LocalDate.now().plusYears(1))
                .experienceYears(10)
                .status(DriverStatus.ON_DELIVERY)
                .vehicleId("VH-007")
                .currentShipmentIds(new ArrayList<>(List.of("SH-1012")))
                .createdAt(LocalDateTime.now().minusDays(250))
                .userId(null)
                .performanceRating(4.8)
                .totalDeliveries(140)
                .successfulDeliveries(137)
                .build());

        dataStore.saveDriver(Driver.builder()
                .id("DR-008")
                .name("Krishnamurthy S")
                .email("krishna.s@fleetops.com")
                .phone("9876543217")
                .address("7, Omalur Main Rd")
                .city("Salem")
                .licenseNumber("TN-DL-2026-001234")
                .licenseExpiry(LocalDate.now().plusYears(2))
                .experienceYears(5)
                .status(DriverStatus.ON_LEAVE)
                .vehicleId(null)
                .currentShipmentIds(new ArrayList<>())
                .createdAt(LocalDateTime.now().minusDays(100))
                .userId(null)
                .performanceRating(4.4)
                .totalDeliveries(70)
                .successfulDeliveries(67)
                .build());

        dataStore.saveDriver(Driver.builder()
                .id("DR-009")
                .name("Vignesh Raja")
                .email("vignesh.raja@fleetops.com")
                .phone("9876543218")
                .address("10, Rayakottai Rd")
                .city("Hosur")
                .licenseNumber("TN-DL-2027-005678")
                .licenseExpiry(LocalDate.now().plusYears(3))
                .experienceYears(6)
                .status(DriverStatus.AVAILABLE)
                .vehicleId("VH-009")
                .currentShipmentIds(new ArrayList<>(List.of("SH-1014")))
                .createdAt(LocalDateTime.now().minusDays(140))
                .userId(null)
                .performanceRating(4.7)
                .totalDeliveries(105)
                .successfulDeliveries(102)
                .build());

        dataStore.saveDriver(Driver.builder()
                .id("DR-010")
                .name("Dhanasekar P")
                .email("dhana.p@fleetops.com")
                .phone("9876543219")
                .address("19, Tiruvallur High Rd")
                .city("Tiruvallur")
                .licenseNumber("TN-DL-2023-009012")
                .licenseExpiry(LocalDate.now().minusMonths(1))
                .experienceYears(2)
                .status(DriverStatus.INACTIVE)
                .vehicleId(null)
                .currentShipmentIds(new ArrayList<>())
                .createdAt(LocalDateTime.now().minusDays(70))
                .userId(null)
                .performanceRating(4.0)
                .totalDeliveries(45)
                .successfulDeliveries(40)
                .build());
    }

    private void initRoutes() {
        // Route 1: Chennai to Vellore (Ranipet, Arcot, Katpadi)
        List<RouteStop> r1Stops = new ArrayList<>(Arrays.asList(
                RouteStop.builder().sequence(1).address("SIPCOT Phase 1").city("Ranipet").lat(12.9227).lng(79.3321).shipmentId("SH-1007").status(StopStatus.PENDING).build(),
                RouteStop.builder().sequence(2).address("Bazaar St").city("Arcot").lat(12.9064).lng(79.3109).shipmentId("SH-1008").status(StopStatus.PENDING).build(),
                RouteStop.builder().sequence(3).address("Railway Station Rd").city("Katpadi").lat(12.9698).lng(79.1434).shipmentId("SH-1009").status(StopStatus.PENDING).build()
        ));
        dataStore.saveRoute(Route.builder()
                .id("RT-001")
                .name("Chennai - Vellore Industrial Belt")
                .warehouseId("WH-001")
                .originName("Ambattur, Chennai")
                .stops(r1Stops)
                .totalDistanceKm(138.5)
                .originalDistanceKm(152.0)
                .estimatedDurationMin(180)
                .status(RouteStatus.ACTIVE)
                .driverId("DR-003")
                .vehicleId("VH-003")
                .shipmentIds(new ArrayList<>(Arrays.asList("SH-1007", "SH-1008", "SH-1009")))
                .scheduledDate(LocalDate.now())
                .createdAt(LocalDateTime.now().minusDays(2))
                .optimized(true)
                .build());

        // Route 2: Chennai to Bangalore (Kanchipuram, Krishnagiri, Hosur)
        List<RouteStop> r2Stops = new ArrayList<>(Arrays.asList(
                RouteStop.builder().sequence(1).address("Temple Rd").city("Kanchipuram").lat(12.8342).lng(79.7036).shipmentId("SH-1010").status(StopStatus.COMPLETED).build(),
                RouteStop.builder().sequence(2).address("Roundana Circle").city("Krishnagiri").lat(12.5266).lng(78.2141).shipmentId("SH-1011").status(StopStatus.ARRIVED).build(),
                RouteStop.builder().sequence(3).address("SIPCOT Industrial Area").city("Hosur").lat(12.7409).lng(77.8253).shipmentId(null).status(StopStatus.PENDING).build()
        ));
        dataStore.saveRoute(Route.builder()
                .id("RT-002")
                .name("Chennai - Bangalore Expressway")
                .warehouseId("WH-001")
                .originName("Ambattur, Chennai")
                .stops(r2Stops)
                .totalDistanceKm(346.0)
                .originalDistanceKm(365.0)
                .estimatedDurationMin(360)
                .status(RouteStatus.ACTIVE)
                .driverId("DR-004")
                .vehicleId("VH-004")
                .shipmentIds(new ArrayList<>(Arrays.asList("SH-1010", "SH-1011")))
                .scheduledDate(LocalDate.now())
                .createdAt(LocalDateTime.now().minusDays(1))
                .optimized(true)
                .build());

        // Route 3: Chennai to Coimbatore (Salem, Erode)
        List<RouteStop> r3Stops = new ArrayList<>(Arrays.asList(
                RouteStop.builder().sequence(1).address("Junction Rd").city("Salem").lat(11.6643).lng(78.1460).shipmentId("SH-1012").status(StopStatus.ARRIVED).build(),
                RouteStop.builder().sequence(2).address("Perundurai Rd").city("Erode").lat(11.3410).lng(77.7172).shipmentId(null).status(StopStatus.PENDING).build()
        ));
        dataStore.saveRoute(Route.builder()
                .id("RT-003")
                .name("Chennai - Coimbatore South Trunk")
                .warehouseId("WH-001")
                .originName("Ambattur, Chennai")
                .stops(r3Stops)
                .totalDistanceKm(505.0)
                .originalDistanceKm(520.0)
                .estimatedDurationMin(540)
                .status(RouteStatus.ACTIVE)
                .driverId("DR-007")
                .vehicleId("VH-007")
                .shipmentIds(new ArrayList<>(List.of("SH-1012")))
                .scheduledDate(LocalDate.now().minusDays(1))
                .createdAt(LocalDateTime.now().minusDays(3))
                .optimized(false)
                .build());

        // Route 4: Madurai to Chennai (Dindigul, Trichy, Chengalpattu)
        List<RouteStop> r4Stops = new ArrayList<>(Arrays.asList(
                RouteStop.builder().sequence(1).address("Palani Rd").city("Dindigul").lat(10.3673).lng(77.9803).shipmentId("SH-1015").status(StopStatus.COMPLETED).build(),
                RouteStop.builder().sequence(2).address("Thillai Nagar").city("Trichy").lat(10.7905).lng(78.7047).shipmentId("SH-1016").status(StopStatus.COMPLETED).build(),
                RouteStop.builder().sequence(3).address("GST Rd").city("Chengalpattu").lat(12.6922).lng(79.9765).shipmentId("SH-1017").status(StopStatus.COMPLETED).build()
        ));
        dataStore.saveRoute(Route.builder()
                .id("RT-004")
                .name("Madurai - Chennai Freight Corridor")
                .warehouseId("WH-004")
                .originName("Kappalur, Madurai")
                .stops(r4Stops)
                .totalDistanceKm(462.0)
                .originalDistanceKm(490.0)
                .estimatedDurationMin(480)
                .status(RouteStatus.COMPLETED)
                .driverId("DR-001")
                .vehicleId("VH-002")
                .shipmentIds(new ArrayList<>(Arrays.asList("SH-1015", "SH-1016", "SH-1017")))
                .scheduledDate(LocalDate.now().minusDays(4))
                .createdAt(LocalDateTime.now().minusDays(5))
                .optimized(true)
                .build());

        // Route 5: Bangalore to Chennai (Hosur, Krishnagiri, Kanchipuram)
        List<RouteStop> r5Stops = new ArrayList<>(Arrays.asList(
                RouteStop.builder().sequence(1).address("Hosur Checkpost").city("Hosur").lat(12.7409).lng(77.8253).shipmentId(null).status(StopStatus.PENDING).build(),
                RouteStop.builder().sequence(2).address("Krishnagiri Bypass").city("Krishnagiri").lat(12.5266).lng(78.2141).shipmentId(null).status(StopStatus.PENDING).build(),
                RouteStop.builder().sequence(3).address("Kanchi Bypass").city("Kanchipuram").lat(12.8342).lng(79.7036).shipmentId(null).status(StopStatus.PENDING).build()
        ));
        dataStore.saveRoute(Route.builder()
                .id("RT-005")
                .name("Bangalore - Chennai Return Line")
                .warehouseId("WH-002")
                .originName("Peenya, Bangalore")
                .stops(r5Stops)
                .totalDistanceKm(346.0)
                .originalDistanceKm(346.0)
                .estimatedDurationMin(360)
                .status(RouteStatus.PLANNED)
                .driverId(null)
                .vehicleId(null)
                .shipmentIds(new ArrayList<>())
                .scheduledDate(LocalDate.now().plusDays(1))
                .createdAt(LocalDateTime.now().minusDays(1))
                .optimized(false)
                .build());

        // Route 6: Chennai Express Intra-city (Ambattur, Guindy, Velachery, Sholinganallur)
        List<RouteStop> r6Stops = new ArrayList<>(Arrays.asList(
                RouteStop.builder().sequence(1).address("Guindy Industrial Estate").city("Chennai").lat(13.0067).lng(80.2026).shipmentId("SH-1004").status(StopStatus.PENDING).build(),
                RouteStop.builder().sequence(2).address("Velachery Main Rd").city("Chennai").lat(12.9815).lng(80.2180).shipmentId("SH-1005").status(StopStatus.PENDING).build(),
                RouteStop.builder().sequence(3).address("OMR Elcot SEZ").city("Sholinganallur").lat(12.9010).lng(80.2279).shipmentId(null).status(StopStatus.PENDING).build()
        ));
        dataStore.saveRoute(Route.builder()
                .id("RT-006")
                .name("Chennai Intra-City Fast Delivery")
                .warehouseId("WH-001")
                .originName("Ambattur, Chennai")
                .stops(r6Stops)
                .totalDistanceKm(48.5)
                .originalDistanceKm(54.0)
                .estimatedDurationMin(90)
                .status(RouteStatus.PLANNED)
                .driverId("DR-002")
                .vehicleId("VH-001")
                .shipmentIds(new ArrayList<>(Arrays.asList("SH-1004", "SH-1005")))
                .scheduledDate(LocalDate.now().plusDays(1))
                .createdAt(LocalDateTime.now().minusHours(8))
                .optimized(true)
                .build());

        // Route 7: Coimbatore to Salem (Tiruppur, Erode, Sankari)
        List<RouteStop> r7Stops = new ArrayList<>(Arrays.asList(
                RouteStop.builder().sequence(1).address("Kumaran Rd").city("Tiruppur").lat(11.1085).lng(77.3411).shipmentId("SH-1013").status(StopStatus.ARRIVED).build(),
                RouteStop.builder().sequence(2).address("Brough Rd").city("Erode").lat(11.3410).lng(77.7172).shipmentId(null).status(StopStatus.PENDING).build(),
                RouteStop.builder().sequence(3).address("Tiruchengode Rd").city("Sankari").lat(11.4820).lng(77.8680).shipmentId(null).status(StopStatus.PENDING).build()
        ));
        dataStore.saveRoute(Route.builder()
                .id("RT-007")
                .name("Kongu Regional Connector")
                .warehouseId("WH-003")
                .originName("SIDCO, Coimbatore")
                .stops(r7Stops)
                .totalDistanceKm(165.0)
                .originalDistanceKm(178.0)
                .estimatedDurationMin(210)
                .status(RouteStatus.ACTIVE)
                .driverId("DR-009")
                .vehicleId("VH-009")
                .shipmentIds(new ArrayList<>(List.of("SH-1013")))
                .scheduledDate(LocalDate.now())
                .createdAt(LocalDateTime.now().minusDays(1))
                .optimized(true)
                .build());

        // Route 8: Madurai to Coimbatore (Dindigul, Karur, Palladam)
        List<RouteStop> r8Stops = new ArrayList<>(Arrays.asList(
                RouteStop.builder().sequence(1).address("Dindigul Bypass").city("Dindigul").lat(10.3673).lng(77.9803).shipmentId(null).status(StopStatus.PENDING).build(),
                RouteStop.builder().sequence(2).address("Textile Market").city("Karur").lat(10.9601).lng(78.0766).shipmentId(null).status(StopStatus.PENDING).build()
        ));
        dataStore.saveRoute(Route.builder()
                .id("RT-008")
                .name("Madurai - Coimbatore Cargo Route")
                .warehouseId("WH-004")
                .originName("Kappalur, Madurai")
                .stops(r8Stops)
                .totalDistanceKm(225.0)
                .originalDistanceKm(225.0)
                .estimatedDurationMin(280)
                .status(RouteStatus.PLANNED)
                .driverId(null)
                .vehicleId(null)
                .shipmentIds(new ArrayList<>())
                .scheduledDate(LocalDate.now().plusDays(2))
                .createdAt(LocalDateTime.now().minusDays(1))
                .optimized(false)
                .build());

        // Route 9: Salem to Bangalore (Dharmapuri, Krishnagiri, Hosur)
        List<RouteStop> r9Stops = new ArrayList<>(Arrays.asList(
                RouteStop.builder().sequence(1).address("Salem Main Rd").city("Dharmapuri").lat(12.1211).lng(78.1582).shipmentId(null).status(StopStatus.COMPLETED).build(),
                RouteStop.builder().sequence(2).address("NH44 Circle").city("Krishnagiri").lat(12.5266).lng(78.2141).shipmentId(null).status(StopStatus.COMPLETED).build(),
                RouteStop.builder().sequence(3).address("Industrial Complex").city("Hosur").lat(12.7409).lng(77.8253).shipmentId(null).status(StopStatus.COMPLETED).build()
        ));
        dataStore.saveRoute(Route.builder()
                .id("RT-009")
                .name("Salem - Bangalore Direct Link")
                .warehouseId("WH-005")
                .originName("Fairlands, Salem")
                .stops(r9Stops)
                .totalDistanceKm(202.0)
                .originalDistanceKm(215.0)
                .estimatedDurationMin(240)
                .status(RouteStatus.COMPLETED)
                .driverId("DR-005")
                .vehicleId("VH-005")
                .shipmentIds(new ArrayList<>())
                .scheduledDate(LocalDate.now().minusDays(3))
                .createdAt(LocalDateTime.now().minusDays(4))
                .optimized(true)
                .build());

        // Route 10: Chennai to Tiruvallur (Avadi, Thiruninravur, Tiruvallur)
        List<RouteStop> r10Stops = new ArrayList<>(Arrays.asList(
                RouteStop.builder().sequence(1).address("CTH Road, Avadi").city("Chennai").lat(13.1147).lng(80.1009).shipmentId("SH-1014").status(StopStatus.ARRIVED).build(),
                RouteStop.builder().sequence(2).address("Thiruninravur Bazaar").city("Thiruninravur").lat(13.1180).lng(80.0270).shipmentId(null).status(StopStatus.PENDING).build(),
                RouteStop.builder().sequence(3).address("Collectorate Rd").city("Tiruvallur").lat(13.1437).lng(79.9088).shipmentId(null).status(StopStatus.PENDING).build()
        ));
        dataStore.saveRoute(Route.builder()
                .id("RT-010")
                .name("Chennai - Tiruvallur West Route")
                .warehouseId("WH-001")
                .originName("Ambattur, Chennai")
                .stops(r10Stops)
                .totalDistanceKm(42.0)
                .originalDistanceKm(45.0)
                .estimatedDurationMin(80)
                .status(RouteStatus.ACTIVE)
                .driverId("DR-006")
                .vehicleId("VH-006")
                .shipmentIds(new ArrayList<>(List.of("SH-1014")))
                .scheduledDate(LocalDate.now())
                .createdAt(LocalDateTime.now().minusHours(12))
                .optimized(true)
                .build());
    }

    private void initShipments() {
        // 20 Shipments:
        // PENDING (2): SH-1001, SH-1003
        // SCHEDULED (3): SH-1004, SH-1005, SH-1006
        // ASSIGNED (3): SH-1007, SH-1008, SH-1009
        // IN_TRANSIT (4): SH-1002, SH-1010, SH-1011, SH-1012
        // OUT_FOR_DELIVERY (2): SH-1013, SH-1014
        // DELIVERED (3): SH-1015, SH-1016, SH-1017
        // DELAYED (2): SH-1018, SH-1019
        // CANCELLED (1): SH-1020

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1001")
                .customerId("CU-001")
                .customerName("Arun Kumar")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("12, Anna Nagar Main Rd, Chennai")
                .deliveryLat(13.0850).deliveryLng(80.2100)
                .packageDescription("Consumer Electronics Box")
                .weightKg(120.0).volumeM3(1.2).quantity(2)
                .priority(ShipmentPriority.STANDARD)
                .status(ShipmentStatus.PENDING)
                .expectedDeliveryDate(LocalDate.now().plusDays(2))
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusHours(6))
                .updatedAt(LocalDateTime.now().minusHours(6))
                .createdBy("admin@fleetops.com")
                .notes("Handle with care, delicate screens")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1002")
                .customerId("CU-002")
                .customerName("Meena Krishnan")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("45, Electronic City Phase 1, Bangalore")
                .deliveryLat(12.8452).deliveryLng(77.6602)
                .packageDescription("Server Network Racks")
                .weightKg(450.0).volumeM3(3.5).quantity(1)
                .priority(ShipmentPriority.HIGH)
                .status(ShipmentStatus.IN_TRANSIT)
                .expectedDeliveryDate(LocalDate.now().plusDays(3))
                .driverId("DR-001")
                .vehicleId("VH-002")
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusHours(5))
                .updatedAt(LocalDateTime.now().minusHours(2))
                .createdBy("dispatcher@fleetops.com")
                .notes("Urgent enterprise deployment")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1003")
                .customerId("CU-003")
                .customerName("Suresh Babu")
                .pickupAddress("SIDCO Hub, Coimbatore")
                .pickupLat(11.0168).pickupLng(76.9558)
                .deliveryAddress("88, Cross Cut Road, Coimbatore")
                .deliveryLat(11.0190).deliveryLng(76.9600)
                .packageDescription("Textile Yarns & Dyes")
                .weightKg(300.0).volumeM3(2.0).quantity(5)
                .priority(ShipmentPriority.LOW)
                .status(ShipmentStatus.PENDING)
                .expectedDeliveryDate(LocalDate.now().plusDays(4))
                .warehouseId("WH-003")
                .createdAt(LocalDateTime.now().minusHours(4))
                .updatedAt(LocalDateTime.now().minusHours(4))
                .createdBy("dispatcher@fleetops.com")
                .notes("Standard delivery cycle")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1004")
                .customerId("CU-005")
                .customerName("Rajesh Patel")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("102, OMR IT Highway, Sholinganallur")
                .deliveryLat(12.9010).deliveryLng(80.2279)
                .packageDescription("Computer Workstations")
                .weightKg(250.0).volumeM3(2.5).quantity(4)
                .priority(ShipmentPriority.HIGH)
                .status(ShipmentStatus.SCHEDULED)
                .expectedDeliveryDate(LocalDate.now().plusDays(1))
                .warehouseId("WH-001")
                .routeId("RT-006")
                .createdAt(LocalDateTime.now().minusHours(18))
                .updatedAt(LocalDateTime.now().minusHours(10))
                .createdBy("dispatcher@fleetops.com")
                .notes("Deliver before 5 PM")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1005")
                .customerId("CU-001")
                .customerName("Arun Kumar")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("Velachery Main Rd, Chennai")
                .deliveryLat(12.9815).deliveryLng(80.2180)
                .packageDescription("Home Appliances")
                .weightKg(180.0).volumeM3(1.8).quantity(2)
                .priority(ShipmentPriority.STANDARD)
                .status(ShipmentStatus.SCHEDULED)
                .expectedDeliveryDate(LocalDate.now().plusDays(1))
                .warehouseId("WH-001")
                .routeId("RT-006")
                .createdAt(LocalDateTime.now().minusHours(16))
                .updatedAt(LocalDateTime.now().minusHours(8))
                .createdBy("admin@fleetops.com")
                .notes("Call customer before arrival")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1006")
                .customerId("CU-012")
                .customerName("Preethi Shankar")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("53, SIPCOT Complex, Ranipet")
                .deliveryLat(12.9227).deliveryLng(79.3321)
                .packageDescription("Industrial Chemicals (Non-Hazardous)")
                .weightKg(500.0).volumeM3(4.0).quantity(10)
                .priority(ShipmentPriority.URGENT)
                .status(ShipmentStatus.SCHEDULED)
                .expectedDeliveryDate(LocalDate.now().plusDays(1))
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusHours(14))
                .updatedAt(LocalDateTime.now().minusHours(6))
                .createdBy("dispatcher@fleetops.com")
                .notes("Urgent raw material for manufacturing")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1007")
                .customerId("CU-004")
                .customerName("Deepa Sundaram")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("31, Gandhi Road, Vellore")
                .deliveryLat(12.9165).deliveryLng(79.1325)
                .packageDescription("Medical Equipment Supplies")
                .weightKg(350.0).volumeM3(3.2).quantity(3)
                .priority(ShipmentPriority.HIGH)
                .status(ShipmentStatus.ASSIGNED)
                .expectedDeliveryDate(LocalDate.now())
                .driverId("DR-003")
                .vehicleId("VH-003")
                .routeId("RT-001")
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now().minusHours(5))
                .createdBy("dispatcher@fleetops.com")
                .notes("Hospital delivery urgent")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1008")
                .customerId("CU-007")
                .customerName("Karthik Subramanian")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("15, Katpadi Main Road, Katpadi")
                .deliveryLat(12.9698).deliveryLng(79.1434)
                .packageDescription("Automotive Parts Cartons")
                .weightKg(200.0).volumeM3(1.8).quantity(5)
                .priority(ShipmentPriority.STANDARD)
                .status(ShipmentStatus.ASSIGNED)
                .expectedDeliveryDate(LocalDate.now())
                .driverId("DR-003")
                .vehicleId("VH-003")
                .routeId("RT-001")
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now().minusHours(4))
                .createdBy("dispatcher@fleetops.com")
                .notes("Auto dealership consignment")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1009")
                .customerId("CU-014")
                .customerName("Saranya Pandian")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("9, Big Kanchipuram Weavers Colony")
                .deliveryLat(12.8342).deliveryLng(79.7036)
                .packageDescription("Silk Weaving Machinery Spare")
                .weightKg(100.0).volumeM3(1.0).quantity(1)
                .priority(ShipmentPriority.LOW)
                .status(ShipmentStatus.ASSIGNED)
                .expectedDeliveryDate(LocalDate.now())
                .driverId("DR-003")
                .vehicleId("VH-003")
                .routeId("RT-001")
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now().minusHours(3))
                .createdBy("dispatcher@fleetops.com")
                .notes("Fragile delicate loom component")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1010")
                .customerId("CU-006")
                .customerName("Anitha Rao")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("22, Koramangala 4th Block, Bangalore")
                .deliveryLat(12.9352).deliveryLng(77.6245)
                .packageDescription("IT Hardware & Monolithic Routers")
                .weightKg(1200.0).volumeM3(9.5).quantity(15)
                .priority(ShipmentPriority.URGENT)
                .status(ShipmentStatus.IN_TRANSIT)
                .expectedDeliveryDate(LocalDate.now())
                .driverId("DR-004")
                .vehicleId("VH-004")
                .routeId("RT-002")
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusDays(2))
                .updatedAt(LocalDateTime.now().minusHours(3))
                .createdBy("dispatcher@fleetops.com")
                .notes("Security escort verified")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1011")
                .customerId("CU-015")
                .customerName("Dinesh Pillai")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("110, Hosur Industrial Complex")
                .deliveryLat(12.7409).deliveryLng(77.8253)
                .packageDescription("Precision Tooling Molds")
                .weightKg(800.0).volumeM3(6.5).quantity(4)
                .priority(ShipmentPriority.HIGH)
                .status(ShipmentStatus.IN_TRANSIT)
                .expectedDeliveryDate(LocalDate.now())
                .driverId("DR-004")
                .vehicleId("VH-004")
                .routeId("RT-002")
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusDays(2))
                .updatedAt(LocalDateTime.now().minusHours(2))
                .createdBy("dispatcher@fleetops.com")
                .notes("Keep vertical at all times")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1012")
                .customerId("CU-008")
                .customerName("Lakshmi Devi")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("67, Avinashi Road, Peelamedu, Coimbatore")
                .deliveryLat(11.0168).deliveryLng(76.9558)
                .packageDescription("Textile Automation Panels")
                .weightKg(2500.0).volumeM3(15.0).quantity(20)
                .priority(ShipmentPriority.HIGH)
                .status(ShipmentStatus.IN_TRANSIT)
                .expectedDeliveryDate(LocalDate.now().plusDays(1))
                .driverId("DR-007")
                .vehicleId("VH-007")
                .routeId("RT-003")
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusDays(3))
                .updatedAt(LocalDateTime.now().minusHours(6))
                .createdBy("admin@fleetops.com")
                .notes("Heavy vehicle escort")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1013")
                .customerId("CU-008")
                .customerName("Lakshmi Devi")
                .pickupAddress("Coimbatore Logistics Hub")
                .pickupLat(11.0168).pickupLng(76.9558)
                .deliveryAddress("Kumaran Rd, Tiruppur")
                .deliveryLat(11.1085).deliveryLng(77.3411)
                .packageDescription("Garment Boxes Export Quality")
                .weightKg(400.0).volumeM3(3.0).quantity(12)
                .priority(ShipmentPriority.URGENT)
                .status(ShipmentStatus.OUT_FOR_DELIVERY)
                .expectedDeliveryDate(LocalDate.now())
                .driverId("DR-009")
                .vehicleId("VH-009")
                .routeId("RT-007")
                .warehouseId("WH-003")
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now().minusMinutes(30))
                .createdBy("dispatcher@fleetops.com")
                .notes("Out with driver Vignesh")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1014")
                .customerId("CU-001")
                .customerName("Arun Kumar")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("CTH Road, Avadi, Chennai")
                .deliveryLat(13.1147).deliveryLng(80.1009)
                .packageDescription("Office Chairs & Furniture")
                .weightKg(200.0).volumeM3(2.0).quantity(6)
                .priority(ShipmentPriority.STANDARD)
                .status(ShipmentStatus.OUT_FOR_DELIVERY)
                .expectedDeliveryDate(LocalDate.now())
                .driverId("DR-006")
                .vehicleId("VH-006")
                .routeId("RT-010")
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusHours(10))
                .updatedAt(LocalDateTime.now().minusMinutes(45))
                .createdBy("dispatcher@fleetops.com")
                .notes("Out for morning batch")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1015")
                .customerId("CU-009")
                .customerName("Venkatesh Murugan")
                .pickupAddress("Madurai Freight Center")
                .pickupLat(9.9252).pickupLng(78.1198)
                .deliveryAddress("Palani Rd, Dindigul")
                .deliveryLat(10.3673).deliveryLng(77.9803)
                .packageDescription("Food Grain Sacks")
                .weightKg(600.0).volumeM3(5.0).quantity(12)
                .priority(ShipmentPriority.STANDARD)
                .status(ShipmentStatus.DELIVERED)
                .expectedDeliveryDate(LocalDate.now().minusDays(4))
                .driverId("DR-001")
                .vehicleId("VH-002")
                .routeId("RT-004")
                .warehouseId("WH-004")
                .createdAt(LocalDateTime.now().minusDays(6))
                .updatedAt(LocalDateTime.now().minusDays(4))
                .createdBy("admin@fleetops.com")
                .notes("Delivered successfully")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1016")
                .customerId("CU-009")
                .customerName("Venkatesh Murugan")
                .pickupAddress("Madurai Freight Center")
                .pickupLat(9.9252).pickupLng(78.1198)
                .deliveryAddress("Thillai Nagar, Trichy")
                .deliveryLat(10.7905).deliveryLng(78.7047)
                .packageDescription("Dry Spices & Condiments")
                .weightKg(350.0).volumeM3(3.0).quantity(8)
                .priority(ShipmentPriority.STANDARD)
                .status(ShipmentStatus.DELIVERED)
                .expectedDeliveryDate(LocalDate.now().minusDays(4))
                .driverId("DR-001")
                .vehicleId("VH-002")
                .routeId("RT-004")
                .warehouseId("WH-004")
                .createdAt(LocalDateTime.now().minusDays(6))
                .updatedAt(LocalDateTime.now().minusDays(4))
                .createdBy("admin@fleetops.com")
                .notes("Received by Mr. Murugan")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1017")
                .customerId("CU-013")
                .customerName("Balaji Venkat")
                .pickupAddress("Madurai Freight Center")
                .pickupLat(9.9252).pickupLng(78.1198)
                .deliveryAddress("84, GST Road, Chengalpattu")
                .deliveryLat(12.6922).deliveryLng(79.9765)
                .packageDescription("Automotive Metal Fasteners")
                .weightKg(750.0).volumeM3(4.5).quantity(10)
                .priority(ShipmentPriority.HIGH)
                .status(ShipmentStatus.DELIVERED)
                .expectedDeliveryDate(LocalDate.now().minusDays(3))
                .driverId("DR-001")
                .vehicleId("VH-002")
                .routeId("RT-004")
                .warehouseId("WH-004")
                .createdAt(LocalDateTime.now().minusDays(5))
                .updatedAt(LocalDateTime.now().minusDays(3))
                .createdBy("admin@fleetops.com")
                .notes("Signed by store keeper")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1018")
                .customerId("CU-010")
                .customerName("Sridevi Nair")
                .pickupAddress("Bangalore Distribution Center")
                .pickupLat(13.0303).pickupLng(77.5597)
                .deliveryAddress("78, 5th Avenue, Indiranagar, Bangalore")
                .deliveryLat(12.9784).deliveryLng(77.6408)
                .packageDescription("Designer Interior Furnishings")
                .weightKg(180.0).volumeM3(2.5).quantity(3)
                .priority(ShipmentPriority.HIGH)
                .status(ShipmentStatus.DELAYED)
                .expectedDeliveryDate(LocalDate.now().minusDays(1))
                .warehouseId("WH-002")
                .createdAt(LocalDateTime.now().minusDays(3))
                .updatedAt(LocalDateTime.now().minusHours(2))
                .createdBy("dispatcher@fleetops.com")
                .notes("Severe waterlogging on route")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1019")
                .customerId("CU-011")
                .customerName("Mohan Rajan")
                .pickupAddress("Salem Regional Depot")
                .pickupLat(11.6643).pickupLng(78.1460)
                .deliveryAddress("19, Junction Main Road, Salem")
                .deliveryLat(11.6700).deliveryLng(78.1300)
                .packageDescription("Steel Fabrication Tools")
                .weightKg(900.0).volumeM3(7.0).quantity(6)
                .priority(ShipmentPriority.URGENT)
                .status(ShipmentStatus.DELAYED)
                .expectedDeliveryDate(LocalDate.now().minusDays(1))
                .warehouseId("WH-005")
                .createdAt(LocalDateTime.now().minusDays(2))
                .updatedAt(LocalDateTime.now().minusHours(1))
                .createdBy("dispatcher@fleetops.com")
                .notes("Vehicle maintenance delay")
                .build());

        dataStore.saveShipment(Shipment.builder()
                .id("SH-1020")
                .customerId("CU-003")
                .customerName("Suresh Babu")
                .pickupAddress("Ambattur Warehouse, Chennai")
                .pickupLat(13.0827).pickupLng(80.2707)
                .deliveryAddress("Cross Cut Road, Coimbatore")
                .deliveryLat(11.0190).deliveryLng(76.9600)
                .packageDescription("Cancelled Order Parcel")
                .weightKg(50.0).volumeM3(0.5).quantity(1)
                .priority(ShipmentPriority.LOW)
                .status(ShipmentStatus.CANCELLED)
                .expectedDeliveryDate(LocalDate.now().plusDays(5))
                .warehouseId("WH-001")
                .createdAt(LocalDateTime.now().minusDays(4))
                .updatedAt(LocalDateTime.now().minusDays(2))
                .createdBy("admin@fleetops.com")
                .notes("Customer cancelled before dispatch")
                .build());
    }

    private void initDeliveries() {
        // 16 Deliveries
        String[][] delData = {
                {"DL-001", "SH-1015", "DR-001", "VH-002", "RT-004", "Palani Rd, Dindigul", "Dindigul", "DELIVERED", "M. Venkatesh", "Received with full seal intact"},
                {"DL-002", "SH-1016", "DR-001", "VH-002", "RT-004", "Thillai Nagar, Trichy", "Trichy", "DELIVERED", "K. Raman", "Signed by manager"},
                {"DL-003", "SH-1017", "DR-001", "VH-002", "RT-004", "84, GST Road, Chengalpattu", "Chengalpattu", "DELIVERED", "Balaji V.", "Received in good condition"},
                {"DL-004", "SH-1010", "DR-004", "VH-004", "RT-002", "22, Koramangala 4th Block", "Bangalore", "IN_TRANSIT", "Anitha Rao", "On highway near Krishnagiri"},
                {"DL-005", "SH-1011", "DR-004", "VH-004", "RT-002", "110, Hosur Industrial Complex", "Hosur", "IN_TRANSIT", "Dinesh Pillai", "Scheduled for late afternoon"},
                {"DL-006", "SH-1012", "DR-007", "VH-007", "RT-003", "67, Avinashi Road, Peelamedu", "Coimbatore", "IN_TRANSIT", "Lakshmi Devi", "Moving towards Salem bypass"},
                {"DL-007", "SH-1013", "DR-009", "VH-009", "RT-007", "Kumaran Rd, Tiruppur", "Tiruppur", "OUT_FOR_DELIVERY", "Saravanan", "Out with driver for 11 AM delivery"},
                {"DL-008", "SH-1014", "DR-006", "VH-006", "RT-010", "CTH Road, Avadi", "Chennai", "OUT_FOR_DELIVERY", "Arun Kumar", "Driver arriving in 30 mins"},
                {"DL-009", "SH-1007", "DR-003", "VH-003", "RT-001", "31, Gandhi Road, Vellore", "Vellore", "SCHEDULED", "Deepa Sundaram", "Assigned and loaded"},
                {"DL-010", "SH-1008", "DR-003", "VH-003", "RT-001", "15, Katpadi Main Road", "Katpadi", "SCHEDULED", "Karthik S.", "Assigned and loaded"},
                {"DL-011", "SH-1009", "DR-003", "VH-003", "RT-001", "9, Big Kanchipuram Weavers Colony", "Kanchipuram", "SCHEDULED", "Saranya P.", "Assigned and loaded"},
                {"DL-012", "SH-1004", null, null, "RT-006", "102, OMR IT Highway", "Chennai", "SCHEDULED", "Rajesh Patel", "Route planned for tomorrow"},
                {"DL-013", "SH-1005", null, null, "RT-006", "Velachery Main Rd", "Chennai", "SCHEDULED", "Arun Kumar", "Route planned for tomorrow"},
                {"DL-014", "SH-1018", null, null, null, "78, 5th Avenue, Indiranagar", "Bangalore", "FAILED", "Sridevi Nair", "Delivery rescheduled due to road block"},
                {"DL-015", "SH-1019", null, null, null, "19, Junction Main Road", "Salem", "RETURNED", "Mohan Rajan", "Vehicle breakdown, parcel returned to hub"},
                {"DL-016", "SH-1002", "DR-001", "VH-002", null, "45, Electronic City Phase 1", "Bangalore", "IN_TRANSIT", null, "Shipment is in transit to the customer"}
        };

        for (String[] d : delData) {
            Delivery delivery = Delivery.builder()
                    .id(d[0])
                    .shipmentId(d[1])
                    .driverId(d[2])
                    .vehicleId(d[3])
                    .routeId(d[4])
                    .destinationAddress(d[5])
                    .destinationCity(d[6])
                    .scheduledDate(LocalDate.now())
                    .deliveryDate("DELIVERED".equals(d[7]) ? LocalDateTime.now().minusDays(2) : null)
                    .status(DeliveryStatus.valueOf(d[7]))
                    .receiverName(d[8])
                    .remarks(d[9])
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .failureReason("FAILED".equals(d[7]) || "RETURNED".equals(d[7]) ? d[9] : null)
                    .build();
            dataStore.saveDelivery(delivery);
        }
    }

    private void initShipmentHistory() {
        // 23 History Records
        Object[][] historyData = {
                {"SH-1001", null, ShipmentStatus.PENDING, "Order received from customer", "system", 6},
                {"SH-1002", null, ShipmentStatus.PENDING, "Order received from enterprise client", "system", 5},
                {"SH-1002", ShipmentStatus.PENDING, ShipmentStatus.SCHEDULED, "Shipment scheduled on the Bangalore route", "dispatcher@fleetops.com", 4},
                {"SH-1002", ShipmentStatus.SCHEDULED, ShipmentStatus.ASSIGNED, "Assigned to Ravi Kumar (DR-001) and vehicle VH-002", "dispatcher@fleetops.com", 3},
                {"SH-1002", ShipmentStatus.ASSIGNED, ShipmentStatus.IN_TRANSIT, "Departed Chennai Central Warehouse", "driver@fleetops.com", 2},
                {"SH-1003", null, ShipmentStatus.PENDING, "Order booked at hub", "system", 4},
                {"SH-1004", null, ShipmentStatus.PENDING, "Shipment placed", "system", 18},
                {"SH-1004", ShipmentStatus.PENDING, ShipmentStatus.SCHEDULED, "Scheduled on Route RT-006", "dispatcher@fleetops.com", 10},
                {"SH-1005", null, ShipmentStatus.PENDING, "Shipment placed", "system", 16},
                {"SH-1005", ShipmentStatus.PENDING, ShipmentStatus.SCHEDULED, "Scheduled on Route RT-006", "dispatcher@fleetops.com", 8},
                {"SH-1007", null, ShipmentStatus.PENDING, "Order created", "system", 24},
                {"SH-1007", ShipmentStatus.PENDING, ShipmentStatus.SCHEDULED, "Route RT-001 scheduled", "dispatcher@fleetops.com", 18},
                {"SH-1007", ShipmentStatus.SCHEDULED, ShipmentStatus.ASSIGNED, "Assigned to DR-003 and VH-003", "dispatcher@fleetops.com", 5},
                {"SH-1010", null, ShipmentStatus.PENDING, "Enterprise order placed", "system", 48},
                {"SH-1010", ShipmentStatus.PENDING, ShipmentStatus.SCHEDULED, "Route RT-002 scheduled", "dispatcher@fleetops.com", 36},
                {"SH-1010", ShipmentStatus.SCHEDULED, ShipmentStatus.ASSIGNED, "Assigned to Senthil Kumar (DR-004)", "dispatcher@fleetops.com", 24},
                {"SH-1010", ShipmentStatus.ASSIGNED, ShipmentStatus.IN_TRANSIT, "Departed Chennai Central Warehouse", "dispatcher@fleetops.com", 3},
                {"SH-1013", ShipmentStatus.ASSIGNED, ShipmentStatus.IN_TRANSIT, "Dispatched from Coimbatore hub", "dispatcher@fleetops.com", 6},
                {"SH-1013", ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY, "Package with driver for local delivery", "driver@fleetops.com", 1},
                {"SH-1015", ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED, "Received by Venkatesh Murugan with OTP", "driver@fleetops.com", 96},
                {"SH-1016", ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED, "Received by Raman with signature", "driver@fleetops.com", 96},
                {"SH-1018", ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELAYED, "Heavy downpour and waterlogging on Outer Ring Rd", "dispatcher@fleetops.com", 2},
                {"SH-1020", ShipmentStatus.PENDING, ShipmentStatus.CANCELLED, "Cancelled upon customer request", "admin@fleetops.com", 48}
        };

        for (Object[] h : historyData) {
            dataStore.saveShipmentHistory(ShipmentHistory.builder()
                    .id(dataStore.generateHistoryId())
                    .shipmentId((String) h[0])
                    .fromStatus((ShipmentStatus) h[1])
                    .toStatus((ShipmentStatus) h[2])
                    .remarks((String) h[3])
                    .updatedBy((String) h[4])
                    .timestamp(LocalDateTime.now().minusHours((Integer) h[5]))
                    .build());
        }
    }

    private void initNotifications() {
        // 10 Notifications
        dataStore.saveNotification(Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(NotificationType.NEW_SHIPMENT)
                .title("New High-Priority Shipment")
                .message("Shipment SH-1002 has been booked for Bangalore Central distribution.")
                .relatedId("SH-1002")
                .userId(null)
                .read(false)
                .createdAt(LocalDateTime.now().minusMinutes(20))
                .build());

        dataStore.saveNotification(Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(NotificationType.DRIVER_ASSIGNED)
                .title("Driver Assigned to Route RT-001")
                .message("Murugan Selvam (DR-003) assigned to Chennai-Vellore route.")
                .relatedId("RT-001")
                .userId(null)
                .read(false)
                .createdAt(LocalDateTime.now().minusHours(1))
                .build());

        dataStore.saveNotification(Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(NotificationType.VEHICLE_ASSIGNED)
                .title("Vehicle Allocation Confirmed")
                .message("Tata Ace (TN01AB1234) allocated to local Chennai deliveries.")
                .relatedId("VH-001")
                .userId(null)
                .read(true)
                .createdAt(LocalDateTime.now().minusHours(3))
                .build());

        dataStore.saveNotification(Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(NotificationType.SHIPMENT_DELAYED)
                .title("Delay Alert: Shipment SH-1018")
                .message("Shipment SH-1018 is delayed due to severe waterlogging on route.")
                .relatedId("SH-1018")
                .userId(null)
                .read(false)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build());

        dataStore.saveNotification(Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(NotificationType.DELIVERY_COMPLETED)
                .title("Delivery Successful: SH-1015")
                .message("Shipment SH-1015 was delivered successfully to Dindigul.")
                .relatedId("SH-1015")
                .userId(null)
                .read(true)
                .createdAt(LocalDateTime.now().minusDays(4))
                .build());

        dataStore.saveNotification(Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(NotificationType.VEHICLE_MAINTENANCE)
                .title("Maintenance Due Alert")
                .message("Vehicle VH-008 (TN08OP1234) is currently under scheduled maintenance.")
                .relatedId("VH-008")
                .userId(null)
                .read(false)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build());

        dataStore.saveNotification(Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(NotificationType.LICENSE_EXPIRY)
                .title("Driver License Expiry Warning")
                .message("Driver Dhanasekar P (DR-010) license has expired. Action required.")
                .relatedId("DR-010")
                .userId(null)
                .read(false)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build());

        dataStore.saveNotification(Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(NotificationType.DELIVERY_COMPLETED)
                .title("Delivery Confirmed: SH-1017")
                .message("Shipment SH-1017 delivered with electronic signature captured.")
                .relatedId("SH-1017")
                .userId(null)
                .read(true)
                .createdAt(LocalDateTime.now().minusDays(3))
                .build());

        dataStore.saveNotification(Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(NotificationType.NEW_SHIPMENT)
                .title("Urgent Chemical Consignment")
                .message("Shipment SH-1006 marked as URGENT requires immediate scheduling.")
                .relatedId("SH-1006")
                .userId(null)
                .read(false)
                .createdAt(LocalDateTime.now().minusHours(14))
                .build());

        dataStore.saveNotification(Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(NotificationType.DRIVER_ASSIGNED)
                .title("Route Assignment Notification")
                .message("You have been assigned to Route RT-002 with 2 deliveries.")
                .relatedId("RT-002")
                .userId("USR-003")
                .read(false)
                .createdAt(LocalDateTime.now().minusHours(12))
                .build());
    }
}
