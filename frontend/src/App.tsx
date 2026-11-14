import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { PrivateRoute } from './components/PrivateRoute';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { DriverLayout } from './layouts/DriverLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Admin / Dispatcher Pages
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { ShipmentListPage } from './pages/shipments/ShipmentListPage';
import { CreateShipmentPage } from './pages/shipments/CreateShipmentPage';
import { ShipmentDetailPage } from './pages/shipments/ShipmentDetailPage';
import { ShipmentTrackingPage } from './pages/shipments/ShipmentTrackingPage';
import { VehicleListPage } from './pages/fleet/VehicleListPage';
import { AddVehiclePage } from './pages/fleet/AddVehiclePage';
import { EditVehiclePage } from './pages/fleet/EditVehiclePage';
import { VehicleDetailPage } from './pages/fleet/VehicleDetailPage';
import { VehicleAllocationPage } from './pages/fleet/VehicleAllocationPage';
import { DriverListPage } from './pages/drivers/DriverListPage';
import { AddDriverPage } from './pages/drivers/AddDriverPage';
import { EditDriverPage } from './pages/drivers/EditDriverPage';
import { DriverDetailPage } from './pages/drivers/DriverDetailPage';
import { RouteListPage } from './pages/routes/RouteListPage';
import { CreateRoutePage } from './pages/routes/CreateRoutePage';
import { RouteDetailPage } from './pages/routes/RouteDetailPage';
import { RouteOptimizationPage } from './pages/routes/RouteOptimizationPage';
import { CustomerListPage } from './pages/customers/CustomerListPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { WarehouseListPage } from './pages/warehouses/WarehouseListPage';
import { WarehouseDetailPage } from './pages/warehouses/WarehouseDetailPage';
import { DeliveryListPage } from './pages/deliveries/DeliveryListPage';
import { DeliveryDetailPage } from './pages/deliveries/DeliveryDetailPage';
import { DeliveryReportsPage } from './pages/reports/DeliveryReportsPage';
import { VehicleUtilizationReportPage } from './pages/reports/VehicleUtilizationReportPage';
import { DriverPerformanceReportPage } from './pages/reports/DriverPerformanceReportPage';
import { RouteEfficiencyReportPage } from './pages/reports/RouteEfficiencyReportPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { NotificationListPage } from './pages/notifications/NotificationListPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ProfilePage } from './pages/profile/ProfilePage';

// Driver Portal Pages
import { DriverDashboard } from './pages/driver-portal/DriverDashboard';
import { DriverDeliveriesPage } from './pages/driver-portal/DriverDeliveriesPage';
import { DriverProofOfDeliveryPage } from './pages/driver-portal/DriverProofOfDeliveryPage';
import { DriverProfilePage } from './pages/driver-portal/DriverProfilePage';

// Smart Root Redirect
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'DRIVER') {
    return <Navigate to="/driver/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Smart Root Index Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Admin & Dispatcher Protected Portal */}
            <Route
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'DISPATCHER']}>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<AdminDashboard />} />

              {/* Shipments */}
              <Route path="/shipments" element={<ShipmentListPage />} />
              <Route path="/shipments/new" element={<CreateShipmentPage />} />
              <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
              <Route path="/shipments/:id/track" element={<ShipmentTrackingPage />} />

              {/* Fleet Vehicles */}
              <Route path="/fleet" element={<VehicleListPage />} />
              <Route path="/fleet/new" element={<AddVehiclePage />} />
              <Route path="/fleet/allocation" element={<VehicleAllocationPage />} />
              <Route path="/fleet/:id" element={<VehicleDetailPage />} />
              <Route path="/fleet/:id/edit" element={<EditVehiclePage />} />

              {/* Driver Personnel */}
              <Route path="/drivers" element={<DriverListPage />} />
              <Route path="/drivers/new" element={<AddDriverPage />} />
              <Route path="/drivers/:id" element={<DriverDetailPage />} />
              <Route path="/drivers/:id/edit" element={<EditDriverPage />} />

              {/* Delivery Routes */}
              <Route path="/routes" element={<RouteListPage />} />
              <Route path="/routes/new" element={<CreateRoutePage />} />
              <Route path="/routes/optimize" element={<RouteOptimizationPage />} />
              <Route path="/routes/:id" element={<RouteDetailPage />} />

              {/* Customer Accounts */}
              <Route path="/customers" element={<CustomerListPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />

              {/* Warehouse Facilities */}
              <Route path="/warehouses" element={<WarehouseListPage />} />
              <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />

              {/* Deliveries Registry */}
              <Route path="/deliveries" element={<DeliveryListPage />} />
              <Route path="/deliveries/:id" element={<DeliveryDetailPage />} />

              {/* Analytics & Reports */}
              <Route path="/reports/deliveries" element={<DeliveryReportsPage />} />
              <Route
                path="/reports/vehicle-utilization"
                element={<VehicleUtilizationReportPage />}
              />
              <Route
                path="/reports/driver-performance"
                element={<DriverPerformanceReportPage />}
              />
              <Route
                path="/reports/route-efficiency"
                element={<RouteEfficiencyReportPage />}
              />

              {/* System Admin, Notifications, Settings, Profile */}
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/notifications" element={<NotificationListPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Driver Dedicated Protected Portal */}
            <Route
              path="/driver"
              element={
                <PrivateRoute allowedRoles={['DRIVER', 'ADMIN']}>
                  <DriverLayout />
                </PrivateRoute>
              }
            >
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="deliveries" element={<DriverDeliveriesPage />} />
              <Route path="pod/:id" element={<DriverProofOfDeliveryPage />} />
              <Route path="profile" element={<DriverProfilePage />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
