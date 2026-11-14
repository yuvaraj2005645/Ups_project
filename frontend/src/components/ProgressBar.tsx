import React from 'react';

interface ProgressBarProps {
  value: number; // percentage (0 - 100) or current value
  max?: number;
  label?: string;
  currentValue?: number;
  unit?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  currentValue,
  unit = '',
  showPercent = true,
  size = 'md',
  className = '',
}) => {
  const percentage = max ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : Math.min(100, Math.max(0, Math.round(value)));

  let colorClass = 'bg-emerald-500';
  if (percentage >= 85) {
    colorClass = 'bg-rose-500';
  } else if (percentage >= 70) {
    colorClass = 'bg-amber-500';
  }

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent || max !== undefined) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
          {label && <span>{label}</span>}
          <div className="ml-auto flex items-center space-x-1.5">
            {max !== undefined && currentValue !== undefined && (
              <span className="text-slate-500 font-normal">
                {currentValue} / {max} {unit}
              </span>
            )}
            {showPercent && (
              <span className={`font-semibold ${
                percentage >= 85 ? 'text-rose-600' : percentage >= 70 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {percentage}%
              </span>
            )}
          </div>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
