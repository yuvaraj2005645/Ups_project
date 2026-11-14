import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactElement;
  allowedRoles?: Role[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullPage message="Authenticating session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is DRIVER, redirect them to their driver dashboard
    if (user.role === 'DRIVER') {
      return <Navigate to="/driver/dashboard" replace />;
    }
    // If user is ADMIN or DISPATCHER trying to view driver portal, redirect to admin dashboard
    if (user.role === 'ADMIN' || user.role === 'DISPATCHER') {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">403 - Access Denied</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          You do not have the required permissions to view this page. Please contact your system administrator.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children;
};
