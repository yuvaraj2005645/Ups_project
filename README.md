# FleetOps – Intelligent Logistics Management System

> ⚠️ **DEMO APPLICATION**: This application uses in-memory data storage. All data resets when the backend is restarted. No database is required or used. JWT tokens are for demonstration purposes only and should not be used in production.

---

## Overview

FleetOps is a full-stack enterprise logistics management platform that centralizes delivery route optimization, vehicle capacity management, driver coordination, and real-time shipment tracking.

**Core Capabilities:**
- 🗺️ **Intelligent Route Optimization** – Nearest-Neighbor Heuristic + Haversine distance algorithm that calculates the optimal stop sequence, compares it with the original route, and reports distance/time savings.
- 🚛 **Vehicle Capacity Management** – Real-time weight and volume constraint enforcement. Automatically recommends vehicles ranked by fit score. Prevents capacity violations.
- 📦 **End-to-End Shipment Lifecycle** – From creation to proof-of-delivery with status history tracking.
- 👨‍✈️ **Driver Portal** – Dedicated interface for drivers to view assignments, navigate routes, update delivery status, and submit digital proof of delivery.
- 📊 **Analytics & Reports** – Live dashboard with 6 charts, 5 report types, and CSV export.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| React Router DOM | 6 | Client-side routing |
| Axios | 1.x | HTTP client + JWT interceptors |
| Recharts | 2.x | Charts & analytics |
| Lucide React | latest | Icon library |
| React Hook Form | 7 | Form management |
| Zod | 3 | Schema validation |
| React Leaflet + Leaflet | 4/1.9 | Interactive maps (OpenStreetMap) |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 25 (LTS) | Runtime |
| Spring Boot | 3.5.16 | Application framework |
| Spring Security | 6 | Authentication & authorization |
| JJWT | 0.12.3 | JWT token generation/validation |
| Lombok | 1.18.46 | Boilerplate reduction |
| Maven | 3.9.9 | Build tool |
| Java Collections | – | In-memory data store (ConcurrentHashMap, CopyOnWriteArrayList) |

> **No database.** No JPA, Hibernate, H2, or any database dependency is used.

---

## Features

### Admin / Dispatcher Features
- ✅ Dashboard with 10 KPI cards, 6 charts, recent activity, alerts
- ✅ Shipment management (create, edit, assign, track, cancel)
- ✅ Fleet management with capacity progress bars
- ✅ Automatic vehicle recommendation engine (weight + volume ranked)
- ✅ Driver management with license expiry warnings
- ✅ Route optimization with before/after comparison on interactive map
- ✅ Multi-stop route planning with reorder support
- ✅ Customer management with shipment history
- ✅ Warehouse management with storage utilization
- ✅ Delivery management with digital proof of delivery
- ✅ 5 report types with CSV export
- ✅ User management with role assignment
- ✅ Notification center with real-time polling
- ✅ Settings and profile management

### Driver Features
- ✅ Driver dashboard with today's schedule
- ✅ View only own assigned shipments
- ✅ Interactive route map with GPS location
- ✅ Delivery status updates (enforced valid transitions)
- ✅ Digital proof of delivery (signature canvas + photo)
- ✅ Delivery history and performance stats

### Security
- ✅ JWT-based stateless authentication (24-hour tokens)
- ✅ BCrypt password hashing
- ✅ Role-based access control (ADMIN, DISPATCHER, DRIVER)
- ✅ Protected routes on frontend and backend
- ✅ CORS configured for localhost:5173

---

## Project Structure

```
Delivery Route and Vehicle Capacity Management/
├── backend/                          # Spring Boot application
│   ├── pom.xml
│   └── src/main/java/com/fleetops/
│       ├── FleetOpsApplication.java
│       ├── config/                   # CorsConfig
│       ├── security/                 # JwtUtil, JwtAuthFilter, SecurityConfig, UserDetailsServiceImpl
│       ├── controller/               # 12 REST controllers
│       ├── service/                  # 12 service classes
│       ├── repository/               # InMemoryDataStore.java
│       ├── model/                    # 10 entity classes + 14 enums
│       ├── dto/                      # Request/Response DTOs
│       ├── exception/                # GlobalExceptionHandler
│       └── initializer/              # SampleDataInitializer.java
│
├── frontend/                         # Vite React application
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── types/index.ts            # All TypeScript interfaces
│       ├── services/                 # 12 API service modules
│       ├── contexts/AuthContext.tsx  # JWT auth state
│       ├── hooks/                    # useNotifications, useAuth
│       ├── components/               # 20+ shared components
│       ├── layouts/                  # AdminLayout, DriverLayout, AuthLayout
│       └── pages/                    # 35+ page components
│
└── README.md
```

---

## Prerequisites

- **Java 25 (LTS)** (JDK) – [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.9+** – [Download](https://maven.apache.org/download.cgi) OR use the cached wrapper
- **Node.js 18+** – [Download](https://nodejs.org/)
- **npm 9+** – Included with Node.js

> On this machine, Maven 3.9.9 is cached at:  
> `C:\Users\hp\.m2\wrapper\dists\apache-maven-3.9.9\977a63e90f436cd6ade95b4c0e10c20c\bin\mvn.cmd`  
> Java 25 is installed at: `C:\Users\hp\AppData\Local\Programs\Java\jdk-25`

---

## Installation & Running

### Backend

```powershell
# Set JAVA_HOME if not already set
$env:JAVA_HOME = "$env:LOCALAPPDATA\Programs\Java\jdk-25"

# Navigate to backend
cd "e:\Delivery Route and Vechicle Capacity Management\backend"

# Run with Maven (replace path with your mvn location)
$MVN = "C:\Users\hp\.m2\wrapper\dists\apache-maven-3.9.9\977a63e90f436cd6ade95b4c0e10c20c\bin\mvn.cmd"
& $MVN spring-boot:run
```

Backend URL: **http://localhost:8080**  
API Base URL: **http://localhost:8080/api**

> The backend loads all sample data automatically on startup. You will see:
> ```
> INFO - Initializing FleetOps sample data in memory...
> INFO - FleetOps sample data initialized successfully!
> ```

### Frontend

```powershell
# Navigate to frontend
cd "e:\Delivery Route and Vechicle Capacity Management\frontend"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend URL: **http://localhost:5173**

> Both servers must be running simultaneously for the application to function.

---

## Demo Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@fleetops.com | Admin@123 | Full system access |
| **Dispatcher** | dispatcher@fleetops.com | Dispatch@123 | Shipments, Fleet, Routes, Drivers |
| **Driver** | driver@fleetops.com | Driver@123 | Driver portal only |

---

## Sample Data

Loaded automatically on backend startup:

| Entity | Count | Details |
|--------|-------|---------|
| Users | 3 | Admin, Dispatcher, Driver |
| Customers | 15 | Indian names, South Indian cities |
| Warehouses | 5 | Chennai, Bangalore, Coimbatore, Madurai, Salem |
| Vehicles | 10 | Tamil Nadu registration numbers (TN01-TN10) |
| Drivers | 10 | With license numbers, ratings, experience |
| Routes | 10 | Between South Indian cities with real coordinates |
| Shipments | 20 | All lifecycle statuses (SH-1001 to SH-1020) |
| Deliveries | 15 | Linked to in-transit / completed shipments |
| Notifications | 10 | Various types |
| Shipment History | 20 | Status transition audit log |

**Sample Indian Cities with Coordinates:**
- Chennai: 13.0827°N, 80.2707°E
- Vellore: 12.9165°N, 79.1325°E
- Bangalore: 12.9716°N, 77.5946°E
- Coimbatore: 11.0168°N, 76.9558°E
- Madurai: 9.9252°N, 78.1198°E
- Salem: 11.6643°N, 78.1460°E

---

## API Endpoint Reference

### Authentication
```
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

### Dashboard
```
GET    /api/dashboard/overview
```

### Shipments
```
GET    /api/shipments
GET    /api/shipments/{id}
POST   /api/shipments
PUT    /api/shipments/{id}
DELETE /api/shipments/{id}
PATCH  /api/shipments/{id}/status
GET    /api/shipments/{id}/history
POST   /api/shipments/{id}/assign
```

### Vehicles
```
GET    /api/vehicles
GET    /api/vehicles/{id}
POST   /api/vehicles
PUT    /api/vehicles/{id}
GET    /api/vehicles/{id}/capacity
GET    /api/vehicles/available
POST   /api/vehicles/allocate
POST   /api/vehicles/confirm-allocation
```

### Drivers
```
GET    /api/drivers
GET    /api/drivers/{id}
POST   /api/drivers
PUT    /api/drivers/{id}
DELETE /api/drivers/{id}
GET    /api/drivers/available
GET    /api/drivers/{id}/shipments
```

### Routes
```
GET    /api/routes
GET    /api/routes/{id}
POST   /api/routes
PUT    /api/routes/{id}
POST   /api/routes/optimize
POST   /api/routes/assign
```

### Customers
```
GET    /api/customers
GET    /api/customers/{id}
POST   /api/customers
PUT    /api/customers/{id}
DELETE /api/customers/{id}
```

### Warehouses
```
GET    /api/warehouses
GET    /api/warehouses/{id}
POST   /api/warehouses
PUT    /api/warehouses/{id}
```

### Deliveries
```
GET    /api/deliveries
GET    /api/deliveries/{id}
POST   /api/deliveries
PATCH  /api/deliveries/{id}/status
POST   /api/deliveries/{id}/proof
```

### Reports
```
GET    /api/reports/shipments
GET    /api/reports/vehicles
GET    /api/reports/routes
GET    /api/reports/drivers
GET    /api/reports/deliveries
```

### Users
```
GET    /api/users
POST   /api/users
PUT    /api/users/{id}
PATCH  /api/users/{id}/role
```

### Notifications
```
GET    /api/notifications
PATCH  /api/notifications/{id}/read
PATCH  /api/notifications/mark-all-read
```

---

## Route Optimization Algorithm

The system implements a **Nearest-Neighbor Heuristic** with **Haversine distance calculations**:

```
1. Start at warehouse (origin) coordinates
2. Mark all delivery stops as unvisited
3. While unvisited stops remain:
   a. Find the nearest unvisited stop using Haversine formula
   b. Add it to the optimized sequence
   c. Mark as visited, move to this stop as current position
4. Return optimized stop order
5. Calculate:
   - Original distance = sum of distances in original input order
   - Optimized distance = sum of distances in optimized order
   - Savings = original - optimized
   - Time saved = savings / 60 km/h average speed
```

**Haversine Formula** accounts for Earth's curvature:
```
R = 6371 km
dLat = lat2 - lat1 (radians)
dLon = lon2 - lon1 (radians)
a = sin²(dLat/2) + cos(lat1)·cos(lat2)·sin²(dLon/2)
distance = 2R·atan2(√a, √(1−a))
```

> **Note**: Distances are point-to-point geodesic (great-circle) estimates, not actual road distances. They are clearly labelled as estimated distances.

---

## Vehicle Capacity & Allocation Algorithm

**Validation Rules:**
- Never allow `currentWeight + newShipmentWeight > maxWeight`
- Never allow `currentVolume + newShipmentVolume > maxVolume`
- Reject UNDER_MAINTENANCE and INACTIVE vehicles
- Prevent double-assignment of same vehicle to conflicting active trips

**Recommendation Scoring:**
```
After-load weight utilization = (currentWeight + shipmentWeight) / maxWeight × 100
After-load volume utilization = (currentVolume + shipmentVolume) / maxVolume × 100
Score = (weightUtil + volumeUtil) / 2

Labels:
  score > 85% → "Tight Fit"
  score > 60% → "Good Fit"
  score ≤ 60% → "Optimal"

Sort: Higher score first (best-fit packing = less waste)
```

---

## In-Memory Storage Limitations

> ⚠️ **Important**: This is a demonstration application.

| Limitation | Details |
|-----------|---------|
| **Data Reset** | All data is lost when the backend restarts |
| **No Persistence** | No database, no file storage |
| **Single Instance** | Not suitable for load-balanced deployment |
| **File Uploads** | Proof-of-delivery photos stored as base64 strings in memory |
| **Signatures** | Stored as base64 PNG strings in memory |
| **Email Simulation** | Forgot-password does not send real emails |
| **GPS** | Route navigation uses browser Geolocation API (may require HTTPS in production) |

---

## Tested Workflows

| Workflow | Steps |
|---------|-------|
| **Admin Login → Dashboard** | Login as admin → verify 10 KPI cards loaded from API |
| **Create Shipment** | Navigate to Shipments → Create → fill form → submit → verify in list |
| **Vehicle Allocation** | Fleet → Allocate → enter weight/volume → view ranked recommendations → confirm |
| **Route Optimization** | Routes → Optimize → add 3+ stops → click Optimize → see before/after comparison |
| **Driver Login → Delivery** | Login as driver → My Shipments → Start Delivery → Update Status → Submit POD |
| **Capacity Validation** | Try allocating shipment exceeding vehicle max weight → expect rejection with reason |

---

## Architecture Notes

- **Frontend ↔ Backend**: REST JSON over HTTP. All business logic is in Spring Boot. Frontend never calculates capacity or optimizes routes.
- **Thread Safety**: `ConcurrentHashMap` and `CopyOnWriteArrayList` are used for all shared in-memory collections.
- **ID Generation**: `AtomicInteger` counters ensure unique IDs across concurrent requests.
- **Status Machines**: Shipment and delivery status transitions are enforced server-side.
- **JWT**: Tokens expire after 24 hours. Role is embedded in token claims.
- **CORS**: Configured to allow `http://localhost:5173` on all endpoints.

---

## License

This project is a demonstration application for educational purposes.
