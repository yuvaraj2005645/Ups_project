import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'shipment' | 'vehicle' | 'driver' | 'route' | 'delivery' | 'priority' | 'generic';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  if (!status) return null;

  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (normalized) {
    // Green statuses
    case 'DELIVERED':
    case 'AVAILABLE':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'SUCCESS':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;

    // Blue / Indigo statuses
    case 'SCHEDULED':
    case 'ASSIGNED':
    case 'PLANNED':
    case 'STANDARD':
      style = 'bg-blue-50 text-blue-700 border-blue-200';
      break;

    // Amber / Yellow statuses
    case 'IN_TRANSIT':
    case 'ON_DELIVERY':
    case 'HIGH':
      style = 'bg-amber-50 text-amber-700 border-amber-200';
      break;

    // Orange statuses
    case 'OUT_FOR_DELIVERY':
    case 'UNDER_MAINTENANCE':
    case 'ON_LEAVE':
      style = 'bg-orange-50 text-orange-700 border-orange-200';
      break;

    // Red statuses
    case 'DELAYED':
    case 'FAILED':
    case 'FAILED_DELIVERY':
    case 'URGENT':
    case 'DANGER':
      style = 'bg-rose-50 text-rose-700 border-rose-200';
      break;

    // Purple statuses
    case 'RETURNED':
    case 'ENTERPRISE':
      style = 'bg-purple-50 text-purple-700 border-purple-200';
      break;

    // Gray statuses
    case 'PENDING':
    case 'CANCELLED':
    case 'INACTIVE':
    case 'LOW':
    case 'INDIVIDUAL':
    default:
      style = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
  }

  // Format label: snake_case to Title Case
  const formattedLabel = status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {formattedLabel}
    </span>
  );
};
