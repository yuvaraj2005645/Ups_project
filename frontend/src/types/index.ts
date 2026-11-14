export type Role = 'ADMIN' | 'DISPATCHER' | 'DRIVER';

export type ShipmentStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'CANCELLED'
  | 'FAILED_DELIVERY'
  | 'RETURNED';

export type ShipmentPriority = 'LOW' | 'STANDARD' | 'HIGH' | 'URGENT';

export type VehicleStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'UNDER_MAINTENANCE'
  | 'INACTIVE';

export type VehicleType =
  | 'MINI_TRUCK'
  | 'DELIVERY_VAN'
  | 'PICKUP_TRUCK'
  | 'HEAVY_TRUCK'
  | 'CONTAINER_TRUCK';

export type DriverStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'ON_DELIVERY'
  | 'ON_LEAVE'
  | 'INACTIVE';

export type RouteStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type DeliveryStatus =
  | 'SCHEDULED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED';

export type CustomerType = 'INDIVIDUAL' | 'BUSINESS' | 'ENTERPRISE';

export type NotificationType =
  | 'NEW_SHIPMENT'
  | 'DRIVER_ASSIGNED'
  | 'VEHICLE_ASSIGNED'
  | 'SHIPMENT_DELAYED'
  | 'DELIVERY_COMPLETED'
  | 'VEHICLE_MAINTENANCE'
  | 'LICENSE_EXPIRY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  active: boolean;
  createdAt: string;
}

export interface Shipment {
  id: string;
  customerId: string;
  customerName: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  packageDescription: string;
  weightKg: number;
  volumeM3: number;
  quantity: number;
  priority: ShipmentPriority;
  status: ShipmentStatus;
  expectedDeliveryDate: string;
  driverId?: string;
  vehicleId?: string;
  routeId?: string;
  warehouseId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  type: VehicleType;
  maxWeightKg: number;
  maxVolumeM3: number;
  currentWeightKg: number;
  currentVolumeM3: number;
  fuelType: string;
  status: VehicleStatus;
  driverId?: string;
  year: number;
  color: string;
  maintenanceDue?: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  licenseNumber: string;
  licenseExpiry: string;
  experienceYears: number;
  status: DriverStatus;
  vehicleId?: string;
  currentShipmentIds: string[];
  performanceRating: number;
  totalDeliveries: number;
  successfulDeliveries: number;
}

export interface RouteStop {
  sequence: number;
  address: string;
  city: string;
  lat: number;
  lng: number;
  shipmentId?: string;
  estimatedArrival?: string;
  status: string;
}

export interface Route {
  id: string;
  name: string;
  warehouseId: string;
  originName: string;
  stops: RouteStop[];
  totalDistanceKm: number;
  estimatedDurationMin: number;
  status: RouteStatus;
  driverId?: string;
  vehicleId?: string;
  shipmentIds: string[];
  scheduledDate: string;
  createdAt: string;
  optimized: boolean;
  originalDistanceKm: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: CustomerType;
  registeredAt: string;
  active: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  managerName: string;
  phone: string;
  totalCapacityM3: number;
  occupiedCapacityM3: number;
  status: string;
}

export interface Delivery {
  id: string;
  shipmentId: string;
  driverId: string;
  vehicleId?: string;
  routeId?: string;
  destinationAddress: string;
  destinationCity: string;
  scheduledDate: string;
  deliveryDate?: string;
  status: DeliveryStatus;
  receiverName?: string;
  remarks?: string;
  createdAt: string;
  proofOfDelivery?: {
    signatureUrl?: string;
    photoUrl?: string;
    deliveredAt: string;
    receiverName: string;
    remarks?: string;
  };
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  userId?: string;
  read: boolean;
  createdAt: string;
}

export interface ShipmentHistory {
  id: string;
  shipmentId: string;
  fromStatus: string;
  toStatus: string;
  remarks: string;
  updatedBy: string;
  timestamp: string;
}

export interface VehicleCapacity {
  vehicleId: string;
  maxWeightKg: number;
  maxVolumeM3: number;
  currentWeightKg: number;
  currentVolumeM3: number;
  remainingWeightKg: number;
  remainingVolumeM3: number;
  weightUtilizationPct: number;
  volumeUtilizationPct: number;
}

export interface VehicleRecommendation {
  vehicle: Vehicle;
  remainingWeight: number;
  remainingVolume: number;
  weightUtilizationPct: number;
  volumeUtilizationPct: number;
  recommendationScore: number;
  recommendationLabel: string;
  canAccommodate: boolean;
}

export interface DashboardOverview {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  delayedShipments: number;
  totalVehicles: number;
  availableVehicles: number;
  vehiclesUnderMaintenance: number;
  totalDrivers: number;
  availableDrivers: number;
  activeRoutes: number;
  completedRoutes: number;
  avgVehicleUtilization: number;
  recentShipments: Shipment[];
  recentDeliveries: Delivery[];
  delayedAlerts: Shipment[];
  shipmentStatusDistribution: { status: string; count: number }[];
  monthlyDeliveries: { month: string; count: number }[];
  vehicleUtilizationData: { vehicleId: string; regNumber: string; utilization: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface RouteOptimizationResult {
  optimizedStops: RouteStop[];
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  timeSavedMin: number;
  improvement: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
