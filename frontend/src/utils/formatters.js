/**
 * Shared formatting utilities for the FleetOps Driver Portal
 */

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

export const formatWeight = (kg) => {
  if (kg == null || kg === 0) return "—";
  return `${kg} kg`;
};

export const formatVolume = (m3) => {
  if (m3 == null || m3 === 0) return "—";
  return `${m3} m³`;
};

export const formatDistance = (km) => {
  if (km == null) return "—";
  return `${km.toFixed(1)} km`;
};

export const formatDuration = (minutes) => {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

/** Human-readable label for a status enum value */
export const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/** Returns Tailwind color classes for a given shipment/delivery status */
export const getStatusColor = (status) => {
  const map = {
    PENDING: "bg-slate-100 text-slate-600",
    SCHEDULED: "bg-blue-50 text-blue-700",
    ASSIGNED: "bg-indigo-50 text-indigo-700",
    IN_TRANSIT: "bg-amber-50 text-amber-700",
    OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    DELAYED: "bg-yellow-50 text-yellow-700",
    CANCELLED: "bg-rose-50 text-rose-700",
    FAILED: "bg-red-50 text-red-700",
    FAILED_DELIVERY: "bg-red-50 text-red-700",
    RETURNED: "bg-purple-50 text-purple-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    ACTIVE: "bg-blue-50 text-blue-700",
    PLANNED: "bg-slate-100 text-slate-600",
    AVAILABLE: "bg-emerald-50 text-emerald-700",
    ON_DELIVERY: "bg-amber-50 text-amber-700",
    ON_LEAVE: "bg-slate-100 text-slate-600",
    INACTIVE: "bg-rose-50 text-rose-700",
  };
  return map[status] || "bg-slate-100 text-slate-500";
};

/** Valid next statuses a DRIVER can transition a shipment to */
export const getDriverAllowedTransitions = (currentStatus) => {
  const map = {
    ASSIGNED: ["IN_TRANSIT"],
    IN_TRANSIT: ["OUT_FOR_DELIVERY", "DELAYED"],
    OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_DELIVERY"],
    DELAYED: ["IN_TRANSIT"],
    FAILED_DELIVERY: ["RETURNED", "IN_TRANSIT"],
  };
  return map[currentStatus] || [];
};
