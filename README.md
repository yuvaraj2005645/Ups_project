# FleetOps - Delivery Route and Vehicle Capacity Management

> **Demo application:** FleetOps stores application data in memory. All runtime data resets when the backend restarts. The included sample accounts and JWT configuration are for local demonstration only; configure production-grade persistence, secrets, email delivery, and deployment security before using this application in a real environment.

---

## Overview

FleetOps is a full-stack logistics management demo for coordinating shipments, delivery routes, vehicles, drivers, warehouses, customers, and delivery proof. It provides role-specific Admin, Dispatcher, and Driver experiences backed by a Spring Boot REST API.

The frontend source uses **JavaScript (ES6) and JSX only**. Application components and services are not written in TypeScript.

**Core Capabilities:**
- 🗺️ **Route Optimization** – A nearest-neighbor heuristic using Haversine distances reorders stops and compares estimated distance with the input order.
- 🚛 **Vehicle Capacity Management** – Real-time weight and volume constraint enforcement. Automatically recommends vehicles ranked by fit score. Prevents capacity violations.
- 📦 **End-to-End Shipment Lifecycle** – From creation to proof-of-delivery with status history tracking.
- 👨‍✈️ **Driver Portal** – Dedicated interface for drivers to view assignments, navigate routes, update delivery status, and submit digital proof of delivery.
- 🔐 **Role-Based Login** – Admin, Dispatcher, and Driver login experiences with role-specific branding and demo credential cards.
- 📊 **Analytics & Reports** – Live dashboard with 6 charts, 5 report types, and CSV export.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| JavaScript (ES6) + JSX | – | Frontend language and component format; no TypeScript source |
| React | 18.3 | UI framework |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| React Router DOM | 6 | Client-side routing |
| Axios | 1.x | HTTP client + JWT interceptors |
| Recharts | 2.x | Charts & analytics |
| Lucide React | 0.383.x | Icon library |
| React Hook Form | 7 | Form management |
| Zod | 3 | Schema validation |
| React Leaflet + Leaflet | 4/1.9 | Interactive maps (OpenStreetMap) |
| Vitest | 3.2.x | Frontend test runner |
| jsdom | 27.x | DOM environment for component tests |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 25 | Runtime and compiler target |
| Spring Boot | 3.5.16 | Application framework |
| Spring Security | 6 | Authentication & authorization |
| JJWT | 0.12.3 | JWT token generation/validation |
| Lombok | 1.18.46 | Boilerplate reduction |
| Maven | 3.9+ | Build tool |
| Java Collections | – | In-memory data store (ConcurrentHashMap, CopyOnWriteArrayList) |

> **No database is configured.** The application uses an in-memory repository; there are no JPA, Hibernate, H2, or other database dependencies.

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

### Shared Authentication
- ✅ Responsive Admin, Dispatcher, and Driver login experiences
- ✅ Password visibility, Remember Me, Forgot Password, and role-specific demo credential cards

### Driver Features
- ✅ Driver dashboard with today's schedule
- ✅ View only own assigned shipments
- ✅ Interactive route map with GPS location
- ✅ Delivery status updates (enforced valid transitions)
- ✅ Digital proof of delivery (recipient details and signature canvas)
- ✅ Delivery history and performance stats
- ✅ Driver self-service profile read/update

### Security
- ✅ JWT-based stateless authentication (24-hour tokens)
- ✅ BCrypt password hashing
- ✅ Role-based access control (ADMIN, DISPATCHER, DRIVER)
- ✅ Protected routes on frontend and backend
- ✅ Server-side ownership checks for driver shipment and delivery operations
- ✅ CORS configured for `http://localhost:5173`

---

## Project Structure

```
Delivery Route and Vehicle Capacity Management/
├── backend/                          # Spring Boot application
│   ├── pom.xml                      # Java 25, Spring Boot 3.5.16
│   └── src/main/java/com/fleetops/
│       ├── FleetOpsApplication.java
│       ├── config/                   # CORS configuration
│       ├── controller/               # REST API endpoints
│       ├── service/                  # Business rules and workflows
│       ├── repository/               # Thread-safe in-memory data store
│       ├── model/                    # Domain models and enums
│       ├── dto/                      # Validated API request/response types
│       ├── exception/                # Domain exceptions and API error handling
│       ├── initializer/              # Startup demo-data seeding
│       └── security/                 # Stateless JWT security
│
├── frontend/                         # Vite React application
│   ├── index.html
│   ├── package.json                  # npm scripts and dependencies
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx, main.jsx, index.css
│       ├── components/               # Shared UI components
│       ├── contexts/                 # Authentication state
│       ├── hooks/                    # Reusable UI hooks
│       ├── layouts/                  # Admin, driver, and auth layouts
│       ├── pages/                    # Admin, auth, and driver screens
│       ├── services/                 # Axios client and API modules (.js)
│       ├── types/index.js            # Shared JavaScript domain constants
│       └── utils/                    # Formatting helpers
│
└── README.md
```

---

## Prerequisites

- **JDK 25** – [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.9+** – [Download](https://maven.apache.org/download.cgi)
- **Node.js 20.19+** – [Download](https://nodejs.org/) (npm is included; needed by the frontend test environment)
- **npm 9+** – Included with Node.js

---

## Installation & Running

### Backend

```powershell
cd backend
mvn spring-boot:run
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
cd frontend
npm ci
npm run dev -- --strictPort
```

Frontend URL: **http://localhost:5173**

> Both servers must be running simultaneously for the application to function.
> On Windows, run each server in a separate PowerShell terminal. If Java 25 is not the active JDK, set `JAVA_HOME` to your JDK 25 installation before running Maven.

### Test, build, and package

```powershell
# Frontend JSX tests and production bundle
cd frontend
npm test
npm run build

# Backend: clean build and executable JAR
cd ..\backend
mvn clean install
java -jar target\fleetops-backend-0.0.1-SNAPSHOT.jar
```

The frontend production bundle is written to `frontend/dist`. `npm run preview` serves that bundle locally after a build.
The backend currently has no `src/test` test classes; Maven still runs the test lifecycle as part of `mvn clean install`.

### Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Backend port | `8080` | Spring Boot HTTP port (`SERVER_PORT` can override it). |
| Frontend dev port | `5173` | Vite development server port, set in `frontend/vite.config.js`. |
| Frontend API URL | `http://localhost:8080/api` | Axios base URL. Override with `VITE_API_URL` (for example, in `frontend/.env.local`). |
| JWT expiration | `86400000` ms (24 hours) | Spring property `fleetops.jwt.expiration`; may be supplied as `FLEETOPS_JWT_EXPIRATION`. |
| JWT signing secret | Demo-only configuration value | Set `fleetops.jwt.secret` / `FLEETOPS_JWT_SECRET` to a private, strong Base64-encoded key outside local demo use. Never commit production secrets. |
| Allowed browser origin | `http://localhost:5173` | Configured in `backend/src/main/java/com/fleetops/config/CorsConfig.java`; update it when serving the UI from another origin. |

Spring properties can be supplied through standard Spring Boot configuration, including environment variables such as `SERVER_PORT`, `FLEETOPS_JWT_SECRET`, and `FLEETOPS_JWT_EXPIRATION`. Vite variables must use the `VITE_` prefix and are incorporated into the frontend build. The map uses OpenStreetMap tiles and needs network access; browser geolocation requires permission and, outside localhost, a secure HTTPS origin.

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
| Shipments | 20 | Sampled across pending, scheduled, assigned, in-transit, out-for-delivery, delivered, delayed, and cancelled states (SH-1001 to SH-1020) |
| Deliveries | 16 | Includes the demo driver's active in-transit delivery |
| Notifications | 10 | Various types |
| Shipment History | 23 | Initial status transition audit records |

**Sample Indian Cities with Coordinates:**
- Chennai: 13.0827°N, 80.2707°E
- Vellore: 12.9165°N, 79.1325°E
- Bangalore: 12.9716°N, 77.5946°E
- Coimbatore: 11.0168°N, 76.9558°E
- Madurai: 9.9252°N, 78.1198°E
- Salem: 11.6643°N, 78.1460°E

---

## API Endpoint Reference

The API is rooted at `http://localhost:8080/api`. Except for the authentication endpoints, API requests require a valid JWT in the `Authorization: Bearer <token>` header. Responses are wrapped in the backend's `ApiResponse` type. Query and JSON body fields are validated by the request DTOs; see `backend/src/main/java/com/fleetops/dto/` for their exact schemas.

### Authentication
```
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

`POST /api/auth/login` returns the token and user details. The forgot/reset-password endpoints operate on the in-memory demo user; password reset does not send an email.

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

`GET /api/shipments` supports optional `status`, `driverId`, `vehicleId`, `customerId`, and `priority` query parameters.

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
DELETE /api/vehicles/{id}
```

### Drivers
```
GET    /api/drivers
GET    /api/drivers/{id}
GET    /api/drivers/me
PATCH  /api/drivers/me
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
DELETE /api/routes/{id}
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
DELETE /api/warehouses/{id}
```

### Deliveries
```
GET    /api/deliveries
GET    /api/deliveries/{id}
POST   /api/deliveries
PATCH  /api/deliveries/{id}/status
POST   /api/deliveries/{id}/proof
DELETE /api/deliveries/{id}
```

Driver delivery list, detail, status-update, and proof operations are scoped to the authenticated driver's records. Proof submission requires both the delivery and its shipment to be `OUT_FOR_DELIVERY`; a recipient name and signature are required. A delivery photograph is optional in the current request contract.

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
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
PATCH  /api/users/{id}/role
PATCH  /api/users/{id}/activate
PATCH  /api/users/{id}/deactivate
```

All API routes outside `/api/auth/**` require a bearer token. Authentication endpoints can be called without a token, but `GET /api/auth/me` returns `401` when there is no authenticated user. Controller-level role checks further restrict writes:

| Role | Access summary |
|------|----------------|
| `ADMIN` | Full administrative access, including user and warehouse management and admin-only deletes. |
| `DISPATCHER` | Operational management for shipments, routes, vehicles, deliveries, drivers, and customers; user administration and admin-only deletes are restricted. |
| `DRIVER` | Assigned shipments and deliveries, permitted status/proof operations, and own profile operations. Driver ownership is checked server-side. |

Successful responses use the `ApiResponse` envelope (`success`, `message`, `data`, and `timestamp`). Request DTOs and validation rules are in `backend/src/main/java/com/fleetops/dto/`.

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
1. Start at warehouse (origin) coordinates when a valid warehouse is supplied; otherwise use the first stop as origin
2. Mark all delivery stops as unvisited
3. While unvisited stops remain:
   a. Find the nearest unvisited stop using Haversine formula
   b. Add it to the optimized sequence
   c. Mark as visited, move to this stop as current position
4. Return optimized stop order
5. Calculate:
   - Original distance = origin-to-first-stop plus legs in the original input order
   - Optimized distance = origin-to-first-stop plus legs in the optimized order
   - Savings = original - optimized
   - Estimated time saved = savings / 40 km/h average speed
```

**Haversine Formula** accounts for Earth's curvature:
```
R = 6371 km
dLat = lat2 - lat1 (radians)
dLon = lon2 - lon1 (radians)
a = sin²(dLat/2) + cos(lat1)·cos(lat2)·sin²(dLon/2)
distance = 2R·atan2(√a, √(1−a))
```

> **Note**: Distances are point-to-point geodesic (great-circle) estimates, not road distances or turn-by-turn directions. The nearest-neighbor heuristic is a practical ordering heuristic, not a guarantee of a globally shortest route. Route creation estimates duration at 45 km/h; the optimization response estimates time savings at 40 km/h.

---

## Vehicle Capacity & Allocation Algorithm

**Allocation behavior:**
- Never allow `currentWeight + newShipmentWeight > maxWeight`
- Never allow `currentVolume + newShipmentVolume > maxVolume`
- Exclude UNDER_MAINTENANCE and INACTIVE vehicles from recommendations
- Optionally filter recommendations by vehicle type

**Recommendation Scoring:**
```
After-load weight utilization = (currentWeight + shipmentWeight) / maxWeight × 100
After-load volume utilization = (currentVolume + shipmentVolume) / maxVolume × 100
Score = (weightUtil + volumeUtil) / 2

Labels:
  score > 85% → "Tight Fit"
  score > 60% → "Good Fit"
  score ≤ 60% → "Optimal"

Sort: Higher score first (best-fit packing = less unused capacity)
```

Recommendations are estimates; confirming an allocation applies the shipment's weight and volume to the selected vehicle's in-memory totals.

---

## In-Memory Storage Limitations

> ⚠️ **Important**: This is a demonstration application.

| Limitation | Details |
|-----------|---------|
| **Data Reset** | All data is lost when the backend restarts |
| **No Persistence** | No database, no file storage |
| **Single Instance** | Not suitable for load-balanced deployment |
| **Signatures** | Stored as base64 PNG strings in memory |
| **Email Simulation** | Forgot-password does not send real emails |
| **GPS** | Route navigation uses browser Geolocation API (may require HTTPS in production) |

---

## Typical Workflows

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

### Domain status values

| Domain | Values |
|--------|--------|
| Shipment | `PENDING`, `SCHEDULED`, `ASSIGNED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `DELAYED`, `CANCELLED`, `FAILED_DELIVERY`, `RETURNED` |
| Delivery | `SCHEDULED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `RETURNED` |
| Vehicle | `AVAILABLE`, `ASSIGNED`, `IN_TRANSIT`, `UNDER_MAINTENANCE`, `INACTIVE` |
| Driver | `AVAILABLE`, `ASSIGNED`, `ON_DELIVERY`, `ON_LEAVE`, `INACTIVE` |
| Route | `PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED` |
| Route stop | `PENDING`, `ARRIVED`, `COMPLETED`, `SKIPPED` |
| Warehouse | `ACTIVE`, `INACTIVE`, `MAINTENANCE` |

Shipment status changes are validated on the backend. The current transitions are:

| Current status | Allowed next status |
|----------------|---------------------|
| `PENDING` | `SCHEDULED`, `CANCELLED` |
| `SCHEDULED` | `ASSIGNED`, `CANCELLED` |
| `ASSIGNED` | `IN_TRANSIT`, `CANCELLED` |
| `IN_TRANSIT` | `OUT_FOR_DELIVERY`, `DELAYED` |
| `OUT_FOR_DELIVERY` | `DELIVERED`, `FAILED_DELIVERY` |
| `DELAYED` | `IN_TRANSIT`, `CANCELLED` |
| `FAILED_DELIVERY` | `RETURNED`, `IN_TRANSIT` |
| `DELIVERED`, `CANCELLED`, `RETURNED` | Terminal |

`POST /api/deliveries/{id}/proof` completes the linked shipment through the status-transition service, records recipient details, signature, optional photo and remarks, and updates driver/vehicle assignment metrics. `ShipmentService` and `DeliveryService` are authoritative for the business rules.

## Login and frontend behavior

- The login page supports Admin, Dispatcher, and Driver roles with separate color themes and role-specific panel content.
- Demo profile cards fill the matching account fields; sign-in still uses the normal authentication API.
- Password visibility, Remember Me, Forgot Password navigation, and form validation are part of the existing login flow.
- Desktop uses a two-panel viewport layout. Tablet and mobile use a single-column form layout and allow scrolling when needed.
- Authentication state is managed by `AuthContext`. The shared Axios instance adds the bearer token and clears stored authentication data after an unauthorized response.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Frontend cannot reach the API or reports CORS errors | Confirm the backend is listening on `8080`, the API base URL is correct, and the browser origin matches `CorsConfig` (`http://localhost:5173` by default). |
| Login returns `401` or a protected page redirects to login | Restart the backend to reseed demo accounts, use the matching demo email/password, and sign in again to obtain a fresh JWT. |
| Maven reports Java version or class-file errors | Verify `java --version` and `mvn --version` use JDK 25; run `mvn clean` before recompiling to discard stale generated output. |
| Map tiles do not appear | Check network access to OpenStreetMap tile servers. |
| Browser route navigation does not work | Use the Vite dev server or `npm run preview`; opening `index.html` directly does not provide SPA routing. |

---

## License

This project is a demonstration application for educational purposes.
