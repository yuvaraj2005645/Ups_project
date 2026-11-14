import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center text-xs text-slate-500 ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 sm:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-slate-500 hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1" />
              {isLast || !item.path ? (
                <span className="font-semibold text-slate-800">{item.label}</span>
              ) : (
                <Link
                  to={item.path}
                  className="text-slate-500 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
